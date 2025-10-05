import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import VaultItem from "@/components/VaultItem";
import AddVaultItemDialog from "@/components/AddVaultItemDialog";
import EditVaultItemDialog from "@/components/EditVaultItemDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Lock, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  deriveKey,
  decrypt,
  generateSalt,
  storeSalt,
  retrieveSalt,
  storeKeyInSession,
  retrieveKeyFromSession,
} from "@/lib/encryption";

interface VaultItemData {
  id: string;
  title: string;
  username?: string;
  password: string;
  url?: string;
  notes?: string;
}

const Vault = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPasswordDialog, setShowMasterPasswordDialog] = useState(true);
  const [loading, setLoading] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<VaultItemData | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Try to retrieve key from session
      const sessionKey = await retrieveKeyFromSession(session.user.id);
      if (sessionKey) {
        setEncryptionKey(sessionKey);
        setShowMasterPasswordDialog(false);
        loadVaultItems(sessionKey);
      }
    });
  }, [navigate]);

  const handleMasterPasswordSubmit = async () => {
    if (!masterPassword || !user) return;
    setLoading(true);

    try {
      let salt = retrieveSalt(user.id);
      if (!salt) {
        salt = generateSalt();
        storeSalt(user.id, salt);
      }

      const key = await deriveKey(masterPassword, salt);
      setEncryptionKey(key);
      storeKeyInSession(user.id, key);
      setShowMasterPasswordDialog(false);
      loadVaultItems(key);

      toast({
        title: "Success",
        description: "Vault unlocked successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unlock vault",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVaultItems = async (key: CryptoKey) => {
    try {
      const { data, error } = await supabase
        .from("vault_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const decryptedItems = await Promise.all(
        data.map(async (item) => {
          try {
            return {
              id: item.id,
              title: item.title,
              username: item.username,
              password: await decrypt(item.encrypted_password, key),
              url: item.url,
              notes: item.encrypted_notes
                ? await decrypt(item.encrypted_notes, key)
                : undefined,
            };
          } catch (error) {
            console.error(`Failed to decrypt item ${item.id}:`, error);
            return null;
          }
        })
      );

      setVaultItems(decryptedItems.filter((item) => item !== null) as VaultItemData[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load vault items",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("vault_items").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vault item deleted successfully",
      });

      setVaultItems(vaultItems.filter((item) => item.id !== id));
      setDeletingItemId(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vault item",
        variant: "destructive",
      });
    }
  };

  const filteredItems = vaultItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || showMasterPasswordDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Unlock Your Vault</h1>
            <p className="text-muted-foreground text-center">
              Enter your master password to decrypt your vault
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Master Password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMasterPasswordSubmit()}
            />
            <Button
              onClick={handleMasterPasswordSubmit}
              disabled={loading || !masterPassword}
              className="w-full gradient-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                "Unlock Vault"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Vault</h1>
              <p className="text-muted-foreground">
                {vaultItems.length} item(s) stored securely
              </p>
            </div>
            {encryptionKey && (
              <AddVaultItemDialog
                encryptionKey={encryptionKey}
                onItemAdded={() => loadVaultItems(encryptionKey)}
              />
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vault items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Vault Items */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Add your first password to get started"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => (
                <VaultItem
                  key={item.id}
                  {...item}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => setDeletingItemId(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {encryptionKey && (
        <EditVaultItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          encryptionKey={encryptionKey}
          onItemUpdated={() => {
            loadVaultItems(encryptionKey);
            setEditingItem(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingItemId}
        onOpenChange={(open) => !open && setDeletingItemId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vault Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              password entry from your vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItemId && handleDeleteItem(deletingItemId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Vault;
