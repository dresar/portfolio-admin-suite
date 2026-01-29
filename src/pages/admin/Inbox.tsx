import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Reply,
  MoreHorizontal,
  Download,
  Users,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/admin/DashboardLayout';
import { EmptyState } from '@/components/admin/EmptyState';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useMessages, useSubscribers } from '@/hooks/queries/useMessages';
import { Message } from '@/types';

const Inbox = () => {
  const { messages, isLoading: isMessagesLoading, markMessageAsRead, deleteMessage } = useMessages();
  const { subscribers, isLoading: isSubscribersLoading, deleteSubscriber } = useSubscribers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageSheetOpen, setMessageSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tab, setTab] = useState('inbox');

  // Filter messages
  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    
    // We don't have "archived" field in backend model yet, so assuming all are inbox for now
    // Or we can assume 'isRead' = archived if we wanted, but let's stick to simple logic
    // Actually, let's just show all messages in inbox for now, or filter by isRead if needed.
    // Backend doesn't support archive.
    
    // If we want to simulate archive, we could use a local state or just show all.
    // Let's assume all are Inbox.
    
    // If tab is 'archived', return empty or implement client-side filtering if we add a field later.
    if (tab === 'archived') return [];

    return messages.filter(m =>
      m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery, tab]);

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    if (!subscribers) return [];
    return subscribers.filter(s =>
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subscribers, searchQuery]);

  const unreadCount = messages?.filter(m => !m.isRead).length || 0;

  const handleOpenMessage = async (message: Message) => {
    setSelectedMessage(message);
    setMessageSheetOpen(true);
    if (!message.isRead) {
      try {
        await markMessageAsRead(message.id);
      } catch (error) {
        console.error('Failed to mark as read', error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    try {
        await Promise.all(selectedIds.map(id => deleteMessage(id)));
        setSelectedIds([]);
        setDeleteDialogOpen(false);
        toast.success(`${selectedIds.length} message(s) deleted`);
    } catch (error) {
        toast.error('Failed to delete messages');
    }
  };

  const handleExportSubscribers = () => {
    if (!subscribers) return;
    
    const headers = ['Email', 'Status', 'Subscribed At'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(s => [s.email, s.status, s.subscribedAt].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Subscribers exported to CSV');
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
    toast.success('Opening email client...');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isLoading = isMessagesLoading || isSubscribersLoading;

  if (isLoading) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground mt-1">Manage messages and subscribers</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="inbox" className="relative">
                Inbox
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1.5">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="subscribers">
                <Users className="h-4 w-4 mr-2" />
                Subscribers
              </TabsTrigger>
            </TabsList>

            {tab === 'subscribers' && (
              <Button variant="outline" onClick={handleExportSubscribers}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={tab === 'subscribers' ? 'Search subscribers...' : 'Search messages...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Bulk Actions for Messages */}
          {(tab === 'inbox' || tab === 'archived') && selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 glass rounded-xl mt-4"
            >
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </motion.div>
          )}

          {/* Messages Tab */}
          <TabsContent value="inbox" className="mt-4">
            {filteredMessages.length === 0 ? (
              <EmptyState
                icon="inbox"
                title="No messages"
                description="Your inbox is empty. New messages will appear here."
              />
            ) : (
              <div className="glass rounded-xl divide-y divide-border">
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleOpenMessage(message)}
                    className={cn(
                      "flex items-start gap-4 p-4 cursor-pointer table-row-hover",
                      !message.isRead && "bg-primary/5"
                    )}
                  >
                    <Checkbox
                      checked={selectedIds.includes(message.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, message.id]);
                        } else {
                          setSelectedIds(selectedIds.filter(id => id !== message.id));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!message.isRead && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span className={cn("font-medium truncate", !message.isRead && "text-foreground")}>
                          {message.senderName}
                        </span>
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                          &lt;{message.email}&gt;
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm mt-1 truncate",
                        message.isRead ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {message.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {formatDate(message.createdAt)}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleReply(message.email);
                          }}>
                            <Reply className="h-4 w-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMessage(message.id);
                              toast.success('Message deleted');
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="mt-4">
            {filteredSubscribers.length === 0 ? (
              <EmptyState
                icon="users"
                title="No subscribers"
                description="Newsletter subscribers will appear here."
              />
            ) : (
              <div className="glass rounded-xl divide-y divide-border">
                {filteredSubscribers.map((subscriber, index) => (
                  <motion.div
                    key={subscriber.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-4 table-row-hover"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {subscriber.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{subscriber.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Subscribed {formatDate(subscriber.subscribedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={subscriber.status === 'active' ? 'badge-success' : 'badge-muted'}>
                        {subscriber.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteSubscriber(subscriber.id);
                          toast.success('Subscriber removed');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Detail Sheet */}
      <Sheet open={messageSheetOpen} onOpenChange={setMessageSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          {selectedMessage && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedMessage.subject}</SheetTitle>
                <SheetDescription>
                  From: {selectedMessage.senderName} &lt;{selectedMessage.email}&gt;
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Received: {formatDate(selectedMessage.createdAt)}
                </p>
                <ScrollArea className="h-[60vh]">
                  <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                </ScrollArea>
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => handleReply(selectedMessage.email)} className="flex-1 btn-neon">
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      deleteMessage(selectedMessage.id);
                      setMessageSheetOpen(false);
                      toast.success('Message deleted');
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Selected Messages"
        description={`Are you sure you want to delete ${selectedIds.length} message(s)? This action cannot be undone.`}
        onConfirm={handleDeleteSelected}
        confirmText="Delete"
        variant="destructive"
      />
    </DashboardLayout>
  );
};

export default Inbox;
