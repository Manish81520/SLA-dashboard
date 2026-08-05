import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

// Drops empty/null filter values so "no filter selected" doesn't send
// e.g. ?Status= to the backend.
const buildParams = (filters = {}) => {
    const params = {}
    Object.entries(filters).forEach(([key, val]) => {
        if (val) params[key] = val
    })
    return params
}

export const fetchSummary = (filters) =>
    client.get('/summary', { params: buildParams(filters) }).then((r) => r.data)

export const fetchCandidates = (filters) =>
    client.get('/candidates', { params: buildParams(filters) }).then((r) => r.data)

export const uploadCsv = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return client
        .post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((r) => r.data)
}

export const exportUrl = '/api/export'