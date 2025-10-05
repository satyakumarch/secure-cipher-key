import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { encrypt } from "@/lib/encryption";

interface VaultItem {
  id: string;
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
}

interface EditVaultItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: VaultItem | null;
  encryptionKey: CryptoKey;
  onItemUpdated: () => void;
}

const EditVaultItemDialog = ({
  open,
  onOpenChange,
  item,
  encryptionKey,
  onItemUpdated,
}: EditVaultItemDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        username: item.username || "",
        password: item.password,
        url: item.url || "",
        notes: item.notes || "",
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!item) return;
    if (!formData.title || !formData.password) {
      toast({
        title: "Error",
        description: "Title and password are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Encrypt password and notes
      const encryptedPassword = await encrypt(formData.password, encryptionKey);
      const encryptedNotes = formData.notes
        ? await encrypt(formData.notes, encryptionKey)
        : null;

      const { error } = await supabase
        .from("vault_items")
        .update({
          title: formData.title,
          username: formData.username || null,
          encrypted_password: encryptedPassword,
          url: formData.url || null,
          encrypted_notes: encryptedNotes,
        })
        .eq("id", item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vault item updated successfully",
      });

      onOpenChange(false);
      onItemUpdated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update vault item",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Vault Item</DialogTitle>
          <DialogDescription>
            Update your encrypted vault entry
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="e.g., Gmail Account"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                placeholder="e.g., user@example.com"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-url">Website URL</Label>
              <Input
                id="edit-url"
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Additional notes (encrypted)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gradient-primary">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Item"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVaultItemDialog;
