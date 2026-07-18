const axios = require('axios');
const HotelLocation = require('../../models/hotel/HotelLocation');

const POPULAR_CITIES = [
    { id: 99001, name: "Mumbai, Maharashtra, India", cityName: "Mumbai", type: "CITY" },
    { id: 99002, name: "Delhi, National Capital Territory of Delhi, India", cityName: "Delhi", type: "CITY" },
    { id: 99003, name: "Bengaluru, Karnataka, India", cityName: "Bengaluru", type: "CITY" },
    { id: 99004, name: "Hyderabad, Telangana, India", cityName: "Hyderabad", type: "CITY" },
    { id: 99005, name: "Ahmedabad, Gujarat, India", cityName: "Ahmedabad", type: "CITY" },
    { id: 99006, name: "Chennai, Tamil Nadu, India", cityName: "Chennai", type: "CITY" },
    { id: 99007, name: "Kolkata, West Bengal, India", cityName: "Kolkata", type: "CITY" },
    { id: 99008, name: "Pune, Maharashtra, India", cityName: "Pune", type: "CITY" },
    { id: 99009, name: "Jaipur, Rajasthan, India", cityName: "Jaipur", type: "CITY" },
    { id: 99010, name: "Goa, India", cityName: "Goa", type: "CITY" },
    { id: 99011, name: "Nashik, Maharashtra, India", cityName: "Nashik", type: "CITY" }
];

// Sync locations from Cleartrip to MongoDB recursively (page by page)
const syncLocationsFromCleartrip = async () => {
    const baseUrl = process.env.CLEARTRIP_HOTEL_BASE_URL;
    const apiKey = process.env.CLEARTRIP_HOTEL_API_KEY;
    const url = `${baseUrl}/content/locations`;

    if (!baseUrl || !apiKey) {
        console.error('[Cleartrip Sync] Error: CLEARTRIP_HOTEL_BASE_URL or CLEARTRIP_HOTEL_API_KEY is not defined in env');
        return;
    }

    console.log('[Cleartrip Sync] Starting Cleartrip locations database synchronization...');

    let nextPageToken = null;
    let hasNextPage = true;
    let pageCount = 0;
    let totalParsed = 0;

    try {
        while (hasNextPage) {
            console.log(`[Cleartrip Sync] Fetching page ${pageCount + 1}...`);

            const params = {
                locationType: 'CITY',
                pageSize: 1000
            };
            if (nextPageToken) {
                params.nextPageToken = nextPageToken;
            }

            const response = await axios.get(url, {
                params,
                headers: {
                    'X-CT-API-KEY': apiKey,
                    'x-request-id': `goairclass-sync-${Date.now()}`,
                    'Accept': 'application/json'
                },
                timeout: 20000
            });

            const locationsHierarchy = response.data?.locationsHierarchy || [];
            const metadataMap = response.data?.locationIdToMetadataMap || {};

            hasNextPage = response.data?.hasNextPage || false;
            nextPageToken = response.data?.nextPageToken || null;

            if (locationsHierarchy.length === 0) {
                console.log('[Cleartrip Sync] No locations returned on this page. Stopping.');
                break;
            }

            // Parse locations on this page
            const bulkOps = locationsHierarchy.map(item => {
                const cityId = item.id;
                const cityMeta = metadataMap[cityId];
                if (!cityMeta) return null;

                let displayName = cityMeta.name;
                let parent = item.parent;
                while (parent && parent.id) {
                    const parentMeta = metadataMap[parent.id];
                    if (parentMeta && parentMeta.name) {
                        displayName += `, ${parentMeta.name}`;
                    }
                    parent = parent.parent;
                }

                return {
                    updateOne: {
                        filter: { locationId: cityId },
                        update: {
                            $set: {
                                locationId: cityId,
                                name: displayName,
                                cityName: cityMeta.name,
                                type: cityMeta.type,
                                coordinates: {
                                    centerLatitude: cityMeta.coordinates?.centerLatitude,
                                    centerLongitude: cityMeta.coordinates?.centerLongitude
                                }
                            }
                        },
                        upsert: true
                    }
                };
            }).filter(Boolean);

            if (bulkOps.length > 0) {
                await HotelLocation.bulkWrite(bulkOps);
                totalParsed += bulkOps.length;
                console.log(`[Cleartrip Sync] Page ${pageCount + 1} synced. Upserted ${bulkOps.length} cities.`);
            }

            pageCount++;

            // Safety limit in case of infinite loops
            if (pageCount >= 50) {
                console.log('[Cleartrip Sync] Reached safety limit of 50 pages. Stopping.');
                break;
            }
        }

        console.log(`[Cleartrip Sync] Finished! Successfully synchronized ${totalParsed} cities from Cleartrip to MongoDB.`);
    } catch (err) {
        console.error('[Cleartrip Sync] Error during database synchronization:', err.message);
    }
};

// Automatically run sync on startup and seed popular cities
const initializeLocationsDb = async () => {
    try {
        // First seed popular cities so they are always available in MongoDB
        const bulkOps = POPULAR_CITIES.map(pc => ({
            updateOne: {
                filter: { locationId: pc.id },
                update: {
                    $set: {
                        locationId: pc.id,
                        name: pc.name,
                        cityName: pc.cityName,
                        type: pc.type
                    }
                },
                upsert: true
            }
        }));
        await HotelLocation.bulkWrite(bulkOps);
        console.log(`[Locations Init] Seeded ${POPULAR_CITIES.length} popular cities into MongoDB.`);

        const count = await HotelLocation.countDocuments();
        // If only seeded cities are present (or less), run Cleartrip sync to grab their cities too
        if (count <= POPULAR_CITIES.length) {
            console.log('[Locations Init] Auto-starting Cleartrip sync to fetch partner data...');
            syncLocationsFromCleartrip();
        }
    } catch (err) {
        console.error('[Locations Init] Error initializing locations database:', err.message);
    }
};

// Run initialization check
setTimeout(initializeLocationsDb, 5000); // Wait 5 seconds for Mongo to connect

// Autocomplete Location Search from MongoDB
const getLocations = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || query.trim() === '') {
            return res.json({ success: true, locations: [] });
        }

        // Search locally in MongoDB using Regex (case-insensitive) for fast matching
        const searchRegex = new RegExp(query.trim(), 'i');
        const locations = await HotelLocation.find({
            $or: [
                { cityName: searchRegex },
                { name: searchRegex }
            ]
        })
            .limit(15)
            .lean();

        res.json({ success: true, locations });
    } catch (err) {
        console.error('getLocations Error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Route handler to manually trigger database sync
const triggerSync = async (req, res) => {
    // Run asynchronously in background
    syncLocationsFromCleartrip();
    res.json({ success: true, message: "Synchronization started in background." });
};

module.exports = {
    getLocations,
    triggerSync
};
