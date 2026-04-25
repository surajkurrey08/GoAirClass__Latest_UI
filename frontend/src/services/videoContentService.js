import API from './axios';

export const fetchVideoContent = async () => {
  try {
    const response = await API.get('/content/video');
    return response.data;
  } catch (error) {
    console.error('Error fetching video content:', error);
    // Return defaults if fetch fails
    return {
      title: "Your Story Begins the Moment You Decide to Travel",
      subtitle: "At GoAirClass, we craft personalized trips that go beyond the ordinary — so you can focus on what truly matters: the experience.",
      points: [
        "Handpicked destinations worldwide",
        "Best price guarantee",
        "Dedicated travel support",
        "Seamless booking experience"
      ],
      buttonText: "Start Exploring",
      videoUrl: ""
    };
  }
};

export const updateVideoContent = async (formData) => {
  try {
    const response = await API.post('/content/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes for large videos
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update video content');
  }
};
