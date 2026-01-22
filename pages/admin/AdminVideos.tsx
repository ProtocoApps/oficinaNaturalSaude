import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

type Video = {
  id: number;
  titulo: string;
  descricao: string;
  thumbnail_url: string;
  video_url: string;
  active: boolean;
};

const AdminVideos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    thumbnail_url: '',
    video_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos_home')
        .select('*')
        .order('id');

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleOpenModal = (video?: Video) => {
    setVideoFile(null);
    if (video) {
      setEditingVideo(video);
      setFormData({
        titulo: video.titulo,
        descricao: video.descricao || '',
        thumbnail_url: video.thumbnail_url,
        video_url: video.video_url || '',
      });
    } else {
      setEditingVideo(null);
      setFormData({
        titulo: '',
        descricao: '',
        thumbnail_url: '',
        video_url: '',
      });
    }
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!formData.titulo || !formData.thumbnail_url) {
      alert('Preencha pelo menos o título e a URL da imagem (thumbnail).');
      return;
    }

    setSaving(true);
    try {
      let finalVideoUrl = formData.video_url;

      // Upload de vídeo se houver arquivo selecionado
      if (videoFile) {
        setUploading(true);
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(filePath, videoFile);

        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          alert(`Erro ao fazer upload do vídeo: ${uploadError.message}. Verifique se o bucket 'videos' existe e é público.`);
          setSaving(false);
          setUploading(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(filePath);

        finalVideoUrl = publicUrl;
        setUploading(false);
      }

      const dataToSave = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        thumbnail_url: formData.thumbnail_url,
        video_url: finalVideoUrl,
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('videos_home')
          .update(dataToSave)
          .eq('id', editingVideo.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('videos_home')
          .insert(dataToSave);
        if (error) throw error;
      }
      
      setShowModal(false);
      loadVideos();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert(`Erro ao salvar vídeo: ${error.message}`);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;
    
    try {
      const { error } = await supabase
        .from('videos_home')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadVideos();
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir vídeo');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-gray-900 text-3xl font-bold leading-tight">Gerenciamento de Vídeos</h1>
          <p className="text-gray-500 text-base mt-1">Gerencie os vídeos que aparecem na página inicial.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-neon text-[#132210] font-bold rounded-lg hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Novo Vídeo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin h-8 w-8 border-2 border-neon border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-500">Carregando vídeos...</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">Nenhum vídeo encontrado.</p>
          <p className="text-sm text-gray-400">Adicione vídeos para exibir na Home.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group"
            >
              <div className="relative aspect-video bg-gray-100">
                <img 
                  src={video.thumbnail_url} 
                  alt={video.titulo} 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Sem+Imagem')}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1">{video.titulo}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{video.descricao || 'Sem descrição'}</p>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleOpenModal(video)}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600"
                    title="Excluir"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editingVideo ? 'Editar Vídeo' : 'Novo Vídeo'}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Tutorial de Skin Care"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Breve descrição do vídeo..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL da Imagem (Capa/Thumbnail)</label>
                  <input
                    type="text"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon"
                  />
                  <p className="text-xs text-gray-500 mt-1">Cole o link direto da imagem que aparecerá como capa.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload de Vídeo (Arquivo)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer relative">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span className="material-symbols-outlined text-2xl text-gray-400">upload_file</span>
                    <p className="text-sm text-gray-500 mt-1">
                      {videoFile ? videoFile.name : 'Clique ou arraste um vídeo aqui'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Máx: 50MB. Se enviar um arquivo, a URL abaixo será preenchida automaticamente.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OU URL do Vídeo</label>
                  <input
                    type="text"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="Link para o YouTube, Vimeo, ou arquivo enviado..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-neon/50 focus:border-neon bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-neon text-[#132210] font-bold rounded-lg hover:brightness-110 disabled:opacity-50 flex items-center justify-center"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideos;
