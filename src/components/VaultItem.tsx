import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VaultItemProps {
  id: string;
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const VaultItem = ({
  title,
  username,
  password,
  url,
  notes,
  onEdit,
  onDelete,
}: VaultItemProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });

      setTimeout(() => {
        setCopiedField(null);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to the copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-5 shadow-card hover:shadow-glow transition-all duration-300">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
              >
                {url}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Username */}
        {username && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">
              Username
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={username}
                readOnly
                className="flex-1 h-9 rounded-md border bg-muted px-3 text-sm font-mono"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(username, "Username")}
                className="h-9 w-9 shrink-0"
              >
                {copiedField === "Username" ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground font-medium">
            Password
          </label>
          <div className="flex items-center gap-2">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              readOnly
              className="flex-1 h-9 rounded-md border bg-muted px-3 text-sm font-mono"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => setShowPassword(!showPassword)}
              className="h-9 w-9 shrink-0"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(password, "Password")}
              className="h-9 w-9 shrink-0"
            >
              {copiedField === "Password" ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-medium">
              Notes
            </label>
            <p className="text-sm bg-muted rounded-md p-3">{notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VaultItem;
