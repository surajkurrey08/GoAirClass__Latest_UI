const User = require("../models/User");

const seedSuperAdmin = async () => {
    try {
        const adminMobile = process.env.ADMIN_MOBILE;
        const adminName = process.env.ADMIN_NAME || "Super Admin";

        if (!adminMobile) {
            console.log(" ⚠️ ADMIN_MOBILE not found in .env. Skipping seeding.");
            return;
        }

        // Check if super admin already exists
        const adminExists = await User.findOne({ mobileNumber: adminMobile });

        if (!adminExists) {
            await User.create({
                fullName: adminName,
                mobileNumber: adminMobile,
                role: "superadmin"
            });
            console.log(" ✅ Default Super Admin created:", adminMobile);
        } else {
            // Update to superadmin if not already (in case existing user was promoted via .env)
            if (adminExists.role !== "superadmin") {
                adminExists.role = "superadmin";
                adminExists.fullName = adminName;
                await adminExists.save();
                console.log(" ✅ Existing user updated to Super Admin:", adminMobile);
            } else {
                console.log(" ℹ️ Super Admin already verified:", adminMobile);
            }
        }
    } catch (error) {
        console.error(" ❌ Error seeding Super Admin:", error);
    }
};

module.exports = seedSuperAdmin;
