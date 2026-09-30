import { api } from "../../../services/api";

export async function getApplications() {
  const response = await api.get("/api/applications");
  return response.data;
}

export async function createApplication(application) {
  const response = await api.post("/api/applications", application);
  return response.data;
}

export async function updateApplicationStatus(id, status) {
  const response = await api.patch(`/api/applications/${id}`, { status });
  return response.data;
}

export async function deleteApplication(id) {
  const response = await api.delete(`/api/applications/${id}`);
  return response.data;
}
