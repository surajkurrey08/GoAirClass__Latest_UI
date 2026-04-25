import React, { useState, useEffect } from 'react';
import { Play, Save, Plus, Trash2, Upload, CheckCircle } from 'lucide-react';
import { fetchVideoContent, updateVideoContent } from '../../../services/videoContentService';
import { toast } from 'react-toastify';

export default function VideoContent() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    points: [''],
    buttonText: 'Start Exploring'
  });
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [existingVideoUrl, setExistingVideoUrl] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await fetchVideoContent();
      if (data) {
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          points: data.points && data.points.length > 0 ? data.points : [''],
          buttonText: data.buttonText || 'Start Exploring'
        });
        if (data.videoUrl) {
          setExistingVideoUrl(data.videoUrl);
          setVideoPreview(data.videoUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching video content:', error);
      toast.error('Failed to load content');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePointChange = (index, value) => {
    const newPoints = [...formData.points];
    newPoints[index] = value;
    setFormData({ ...formData, points: newPoints });
  };

  const addPoint = () => {
    setFormData({ ...formData, points: [...formData.points, ''] });
  };

  const removePoint = (index) => {
    const newPoints = formData.points.filter((_, i) => i !== index);
    setFormData({ ...formData, points: newPoints.length > 0 ? newPoints : [''] });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please upload a video file');
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle);
    data.append('buttonText', formData.buttonText);
    data.append('points', JSON.stringify(formData.points.filter(p => p.trim() !== '')));
    if (videoFile) {
      data.append('video', videoFile);
    }

    try {
      await updateVideoContent(data);
      toast.success('Content updated successfully!');
      fetchContent();
      setVideoFile(null);
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error(error.response?.data?.message || 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Video Content</h1>
          <p className="text-gray-500">Update homepage video section text and media</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Main Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter main heading..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
              <textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter description..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bullet Points</label>
              <div className="space-y-3">
                {formData.points.map((point, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handlePointChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder={`Point ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePoint(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addPoint}
                className="mt-3 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                <Plus size={16} /> Add Another Point
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text</label>
                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload New Video</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition"
                  >
                    <Upload size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-600">{videoFile ? videoFile.name : 'Choose Video'}</span>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Play size={20} className="text-blue-600" /> Live Preview
          </h2>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full mb-4">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Our Story</span>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                  {formData.title || 'Your Story Begins...'}
                </h1>
                <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                  {formData.subtitle || 'At GoAirClass, we craft...'}
                </p>
                <ul className="space-y-3 mb-8">
                  {formData.points.filter(p => p.trim() !== '').map((point, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                      <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold text-sm shadow-lg shadow-blue-200">
                  {formData.buttonText} →
                </button>
              </div>

              <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                {videoPreview ? (
                  <video
                    key={videoPreview}
                    src={videoPreview}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                    <Play size={48} className="opacity-20" />
                    <span className="text-sm font-medium">No video uploaded</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer hover:scale-110 transition">
                  <Play size={20} fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 italic">
            This is exactly how it will look on the homepage.
          </p>
        </div>
      </div>
    </div>
  );
}
