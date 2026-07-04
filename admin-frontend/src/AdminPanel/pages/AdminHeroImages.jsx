// src/AdminPanel/pages/AdminHeroImages.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Trash2, Upload, ImageIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { getHeroImages, uploadHeroImage, deleteHeroImage } from '../../services/heroImageService'

const TYPES = [
  { key: 'home',   label: '🏠 Home',    desc: 'Home page slider' },
  { key: 'flight', label: '✈️ Flights',  desc: 'Flight search hero' },
  { key: 'hotel',  label: '🏨 Hotels',  desc: 'Hotel search hero' },
  { key: 'train',  label: '🚆 Trains',  desc: 'Train search hero' },
  { key: 'bus',    label: '🚌 Buses',   desc: 'Bus search hero' },
]

export default function AdminHeroImages() {
  const [activeType, setActiveType] = useState('home')
  const [images, setImages]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [preview, setPreview]       = useState(null)
  const [title, setTitle]           = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [toast, setToast]           = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [dragOver, setDragOver]     = useState(false)
  const fileRef = useRef()

  const loadImages = async (type) => {
    setLoading(true)
    const data = await getHeroImages(type)
    setImages(data)
    setLoading(false)
  }

  useEffect(() => { loadImages(activeType) }, [activeType])

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return showToast('error', 'Sirf image files allowed.')
    if (file.size > 20 * 1024 * 1024) return showToast('error', 'Image 20MB se choti honi chahiye.')
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return showToast('error', 'Pehle image select karo.')
    setUploading(true)
    try {
      await uploadHeroImage(selectedFile, title, activeType)
      showToast('success', 'Image upload ho gayi!')
      setSelectedFile(null); setPreview(null); setTitle('')
      await loadImages(activeType)
    } catch {
      showToast('error', 'Upload failed.')
    }
    setUploading(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete karna chahte ho?')) return
    setDeletingId(id)
    try {
      await deleteHeroImage(id)
      setImages(prev => prev.filter(img => (img._id || img.id) !== id))
      showToast('success', 'Image delete ho gayi.')
    } catch {
      showToast('error', 'Delete failed.')
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-8">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-semibold
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle size={18}/> : <AlertCircle size={18}/>}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Hero Images</h1>
        <p className="text-slate-500 mt-1">Har section ka hero image manage karo.</p>
      </div>

      {/* Type Tabs */}
      <div className="flex flex-wrap gap-3">
        {TYPES.map(t => (
          <button
            key={t.key}
            onClick={() => { setActiveType(t.key); setPreview(null); setSelectedFile(null); setTitle('') }}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all
              ${activeType === t.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {TYPES.find(t => t.key === activeType)?.label} — Image Add Karo
        </h2>
        <p className="text-slate-400 text-sm mb-6">{TYPES.find(t => t.key === activeType)?.desc}</p>

        {/* Drop Zone */}
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-10 text-center transition-all
            ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'}`}
        >
          {preview
            ? <img src={preview} alt="preview" className="mx-auto max-h-52 rounded-xl object-cover shadow-md" />
            : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <ImageIcon size={28}/>
                </div>
                <div>
                  <p className="font-bold text-slate-600 dark:text-slate-300">Click karo ya drag & drop karo</p>
                  <p className="text-sm mt-1">JPG, PNG, WEBP — max 20MB</p>
                </div>
              </div>
            )
          }
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {preview && (
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Image title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleUpload} disabled={uploading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20">
              {uploading ? <Loader size={16} className="animate-spin"/> : <Upload size={16}/>}
              {uploading ? 'Uploading...' : 'Upload Karo'}
            </button>
            <button onClick={() => { setPreview(null); setSelectedFile(null); setTitle('') }}
              className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-500 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Images Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current Images</h2>
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-xs font-bold rounded-full">
            {images.length} Images
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader size={28} className="animate-spin text-slate-400"/>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <ImageIcon size={40} className="mx-auto mb-3 opacity-30"/>
            <p className="font-semibold">Koi image nahi hai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img, i) => (
              <div key={img._id || img.id || i} className="group relative rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-xl transition-all">
                <img src={img.url} alt={img.title || `Hero ${i+1}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                <button
                  onClick={() => handleDelete(img._id || img.id)}
                  disabled={deletingId === (img._id || img.id)}
                  className="absolute top-3 right-3 w-9 h-9 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  {deletingId === (img._id || img.id) ? <Loader size={14} className="animate-spin"/> : <Trash2 size={14}/>}
                </button>
                <div className="p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{img.title || `Hero Image ${i+1}`}</p>
                  <p className="text-xs text-slate-400 mt-1">Slide {i+1}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}