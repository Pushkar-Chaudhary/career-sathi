import { api } from "../../../services/api";
export async function register({username,email,password}){
    const response = await api.post("/api/auth/register",{
        username,email,password
    })
    return response.data
}
export async function login({email,password}){
    const response = await api.post("/api/auth/login",{
    email,password})
    return response.data
}
export async function logout(){
    const response = await api.post("/api/auth/logout")
    return response.data
}
export async function getMe(){
    const response = await api.get("/api/auth/get-me", { timeout: 15000 })
    return response.data
}
export async function createInterviewReport({jobDescription, resume, selfDescription, consentToAI}){
    const response = await api.post("/api/ai/reports", {
        jobDescription,
        resume,
        selfDescription,
        consentToAI
    })
    return response.data
}
export async function getInterviewReports(){
    const response = await api.get("/api/ai/reports")
    return response.data
}
export async function deleteInterviewReport(id){
    const response = await api.delete(`/api/ai/reports/${id}`)
    return response.data
}
export async function createResumeDraft({profile, consentToAI}){
    const response = await api.post("/api/ai/resume-draft", {...profile, consentToAI})
    return response.data
}
export async function askCareerAssistant({messages, consentToAI}){
    const response = await api.post("/api/ai/assistant", {messages, consentToAI})
    return response.data
}
