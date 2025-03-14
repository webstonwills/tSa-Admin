
import { Channel } from "@/pages/Dashboard/Forum";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare } from "lucide-react";

interface ForumChannelListProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
}

const ForumChannelList = ({ 
  channels, 
  selectedChannel, 
  onSelectChannel 
}: ForumChannelListProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Channels
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {channels.length > 0 ? (
            <div className="space-y-1">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto py-2 px-3"
                  onClick={() => onSelectChannel(channel)}
                >
                  <div className="flex flex-col items-start">
                    <div className="font-medium">{channel.name}</div>
                    {channel.description && (
                      <div className="text-xs text-muted-foreground truncate w-full">
                        {channel.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="py-3 px-4 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <p>No channels yet</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ForumChannelList;
