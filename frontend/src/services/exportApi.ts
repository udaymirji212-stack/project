import { apiClient } from './api';

export const exportApi = {
  downloadZip: (projectId: string, projectName: string) => {
    const filename = `${projectName.toLowerCase().replace(/\s+/g, '_')}_source.zip`;
    return apiClient.download(`/projects/${projectId}/export/zip`, filename);
  },
};
