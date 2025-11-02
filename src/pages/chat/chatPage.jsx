import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ChatList from '../../components/Chat/ChatList';
import ChatWindow from '../../components/Chat/ChatWindow';
import { obtenerChats, crearChat } from '../../services/chatService';
import pageStyles from './ChatPage.module.css';

const ChatPage = () => {
  const { token, usuario } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(true);

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    try {
      const res = await obtenerChats(token, 1, 50);
      const datos = res.chats || res.chats || [];
      setChats(datos);
    } catch (err) {
      console.error('Error cargando chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, [token]);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 8000); 
    return () => clearInterval(interval);
  }, [loadChats]);

  const handleOpenChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleCreateChat = async (usuarioId) => {
    try {
      const chat = await crearChat(token, usuarioId);
      await loadChats();
      setSelectedChat(chat);
    } catch (err) {
      console.error('Error creando chat:', err);
      alert(err.message || 'No se pudo crear el chat');
    }
  };

  return (
    <div className={`${pageStyles.container} container-fluid py-4`}>
      <div className={pageStyles.layout}>
        <div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Mensajes</h5>
              <ChatList
                chats={chats}
                loading={loadingChats}
                onOpen={handleOpenChat}
                onCreateChat={handleCreateChat}
                currentUserId={usuario?._id || usuario?.id || usuario}
                selectedChatId={selectedChat?._id}
                token={token} 
              />
            </div>
          </div>
        </div>

        <div>
          <div className="card h-100">
            <div className="card-body d-flex flex-column">
              {selectedChat ? (
                <ChatWindow chat={selectedChat} onClose={() => setSelectedChat(null)} onRefreshChats={loadChats} />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center">
                    <h5>Selecciona un chat</h5>
                    <p className="text-muted">O crea un chat nuevo con un usuario.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
