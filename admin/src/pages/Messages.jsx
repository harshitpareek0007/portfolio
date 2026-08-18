import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Search, Trash2, Mail, MailOpen, ArrowLeft, Reply, Clock } from 'lucide-react';
import * as messageService from '../services/messageService';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // All, Unread, Read
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest
    
    // Selection state for Inbox layout
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    
    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await messageService.getMessages();
            setMessages(data);
        } catch (err) {
            setError('Unable to load messages.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleMessageSelect = async (msg) => {
        setSelectedMessageId(msg._id);
        if (!msg.read) {
            try {
                const updatedMsg = await messageService.updateMessage(msg._id, { read: true });
                setMessages(prev => prev.map(m => m._id === msg._id ? updatedMsg : m));
            } catch (err) {
                console.error('Failed to mark message as read', err);
            }
        }
    };

    const toggleReadStatus = async (msg, e) => {
        if (e) e.stopPropagation();
        try {
            const updatedMsg = await messageService.updateMessage(msg._id, { read: !msg.read });
            setMessages(prev => prev.map(m => m._id === msg._id ? updatedMsg : m));
            showToast(updatedMsg.read ? 'Message marked as read.' : 'Message marked as unread.');
        } catch (err) {
            showToast('Unable to update message.', 'error');
        }
    };

    const openDeleteModal = (id, e) => {
        if (e) e.stopPropagation();
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await messageService.deleteMessage(deletingId);
            showToast('Message deleted successfully.');
            if (selectedMessageId === deletingId) {
                setSelectedMessageId(null);
            }
            setMessages(prev => prev.filter(m => m._id !== deletingId));
            setIsDeleteModalOpen(false);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    const filteredAndSortedMessages = useMemo(() => {
        let result = [...messages];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(m => 
                m.name.toLowerCase().includes(q) || 
                m.email.toLowerCase().includes(q) ||
                (m.subject && m.subject.toLowerCase().includes(q)) ||
                m.message.toLowerCase().includes(q)
            );
        }

        // Filters
        if (filterStatus === 'Unread') {
            result = result.filter(m => !m.read);
        } else if (filterStatus === 'Read') {
            result = result.filter(m => m.read);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            return 0;
        });

        return result;
    }, [messages, searchQuery, filterStatus, sortBy]);

    const unreadCount = useMemo(() => messages.filter(m => !m.read).length, [messages]);
    
    const selectedMessage = useMemo(() => 
        messages.find(m => m._id === selectedMessageId), 
    [messages, selectedMessageId]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const formatShortDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    if (loading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchMessages}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text flex items-center gap-3">
                        Messages 
                        {unreadCount > 0 && (
                            <span className="bg-primary text-white text-sm py-0.5 px-2.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </h1>
                    <p className="text-muted">Manage your contact form submissions</p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search messages..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[120px]"
                    >
                        <option value="All">All Messages</option>
                        <option value="Unread">Unread</option>
                        <option value="Read">Read</option>
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[140px]"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-surface border border-border rounded-xl flex">
                {messages.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center p-8">
                        <EmptyState 
                            title="No messages yet" 
                            description="Messages submitted through your portfolio contact form will appear here." 
                        />
                    </div>
                ) : filteredAndSortedMessages.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center p-8">
                        <EmptyState 
                            title="No Results" 
                            description="No messages match your search or filter criteria." 
                        />
                    </div>
                ) : (
                    <>
                        {/* List Column */}
                        <div className={`w-full lg:w-[400px] xl:w-[450px] border-r border-border flex flex-col h-full overflow-y-auto ${selectedMessageId ? 'hidden lg:flex' : 'flex'}`}>
                            {filteredAndSortedMessages.map(msg => (
                                <div 
                                    key={msg._id} 
                                    onClick={() => handleMessageSelect(msg)}
                                    className={`p-4 border-b border-border cursor-pointer transition-colors relative ${
                                        selectedMessageId === msg._id ? 'bg-primary/5' : 'hover:bg-background'
                                    }`}
                                >
                                    {!msg.read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`font-semibold line-clamp-1 pr-2 ${!msg.read ? 'text-text' : 'text-text/80'}`}>
                                            {msg.name}
                                        </h3>
                                        <span className={`text-xs whitespace-nowrap ${!msg.read ? 'text-primary font-medium' : 'text-muted'}`}>
                                            {formatShortDate(msg.createdAt)}
                                        </span>
                                    </div>
                                    {msg.subject && (
                                        <p className="text-sm text-text/90 font-medium line-clamp-1 mb-1">{msg.subject}</p>
                                    )}
                                    <p className={`text-sm line-clamp-2 ${!msg.read ? 'text-text/90' : 'text-muted'}`}>
                                        {msg.message}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Detail Column */}
                        <div className={`flex-1 h-full overflow-y-auto ${!selectedMessageId ? 'hidden lg:flex' : 'flex'} flex-col bg-background/50`}>
                            {selectedMessage ? (
                                <div className="h-full flex flex-col">
                                    <div className="p-4 sm:p-6 border-b border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Button variant="ghost" onClick={() => setSelectedMessageId(null)} className="lg:hidden p-2 -ml-2">
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                            <div>
                                                <h2 className="text-xl font-bold text-text mb-1">{selectedMessage.name}</h2>
                                                <a href={`mailto:${selectedMessage.email}`} className="text-sm text-primary hover:underline">
                                                    {selectedMessage.email}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" onClick={(e) => toggleReadStatus(selectedMessage, e)}>
                                                {selectedMessage.read ? <Mail className="w-4 h-4 mr-2" /> : <MailOpen className="w-4 h-4 mr-2" />}
                                                {selectedMessage.read ? 'Mark Unread' : 'Mark Read'}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={(e) => openDeleteModal(selectedMessage._id, e)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6 flex-1">
                                        <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
                                                <div>
                                                    {selectedMessage.subject && (
                                                        <h3 className="text-lg font-bold text-text mb-2">Subject: {selectedMessage.subject}</h3>
                                                    )}
                                                    <div className="flex items-center gap-2 text-sm text-muted">
                                                        <Clock className="w-4 h-4" />
                                                        {formatDate(selectedMessage.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="prose prose-invert max-w-none text-text">
                                                <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                                                    {selectedMessage.message}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-6 flex justify-end">
                                            <Button onClick={() => window.location.href = `mailto:${selectedMessage.email}`}>
                                                <Reply className="w-4 h-4 mr-2" />
                                                Reply via Email
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted p-8 text-center flex-col gap-4">
                                    <Mail className="w-12 h-12 opacity-20" />
                                    <p>Select a message to view its contents</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={() => !isSubmitting && setIsDeleteModalOpen(false)} 
                title="Delete Message"
            >
                <div className="space-y-4">
                    <p className="text-text">
                        Are you sure you want to delete this message? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-red-500 hover:bg-red-600 text-white border-transparent"
                        >
                            {isSubmitting ? <Loader size="sm" className="mr-2" /> : null}
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
};

export default Messages;
