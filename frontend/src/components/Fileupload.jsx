import { useRef, useState } from 'react'
import { Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { uploadCsv } from '../api'

export default function FileUpload({ dataset, onUploaded }) {
    const inputRef = useRef(null)
    const [status, setStatus] = useState('idle')
    const [message, setMessage] = useState('')

    const handleFile = async (file) => {
        if (!file) return
        setStatus('uploading')
        setMessage('')
        try {
            const result = await uploadCsv(file)
            setStatus('done')
            setMessage(`Loaded ${result.rowCount} rows`)
            onUploaded()
            setTimeout(() => setStatus('idle'), 2500)
        } catch (err) {
            setStatus('error')
            setMessage(err.response?.data?.detail || 'Upload failed')
        }
    }

    return (
        <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="text-right hidden sm:block">
                <p className="text-caption text-gray-600 leading-tight m-0">Current dataset</p>
                <p className="text-small font-medium text-gray-900 leading-tight m-0 max-w-[220px] truncate">
                    {dataset?.filename ?? 'None loaded'}
                </p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <button
                onClick={() => inputRef.current?.click()}
                disabled={status === 'uploading'}
                className="flex items-center gap-2 bg-white border border-border-dark text-primary text-small font-medium px-4 py-2.5 rounded-button shadow-subtle transition-shadow disabled:opacity-60"
            >
                {status === 'uploading' ? (
                    <Loader2 size={15} className="spin" />
                ) : status === 'done' ? (
                    <CheckCircle2 size={15} className="text-success" />
                ) : (
                    <Upload size={15} />
                )}
                {status === 'uploading' ? 'Uploading...' : status === 'done' ? message : 'Upload CSV'}
            </button>

            {status === 'error' && (
                <p className="text-caption text-accent-red max-w-[180px] m-0">{message}</p>
            )}
        </div>
    )
}