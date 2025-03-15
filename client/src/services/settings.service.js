import api from "./api";

class SettingsService {
  async updateUserProfile(profileData) {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  }

  async updatePassword(passwordData) {
    const response = await api.put("/auth/password", passwordData);
    return response.data;
  }

  async updateStudyPreferences(preferencesData) {
    const response = await api.put("/settings/study", preferencesData);
    return response.data;
  }

  async getUserPreferences() {
    try {
      const response = await api.get("/settings/study");
      return response.data;
    } catch (error) {
      console.error("Error getting preferences:", error);
      // Return default values if the API fails
      return {
        success: true,
        data: {
          newCardsPerDay: 10,
          reviewsPerDay: 50,
          studyOrder: "random",
          theme: "light",
        },
      };
    }
  }
}

export default new SettingsService();
