import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeSimilar: boolean;
}

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });

  const generatePassword = () => {
    const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowercase = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const uppercaseWithSimilar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseWithSimilar = "abcdefghijklmnopqrstuvwxyz";
    const numbersWithSimilar = "0123456789";
    
    let chars = "";
    
    if (options.includeUppercase) {
      chars += options.excludeSimilar ? uppercase : uppercaseWithSimilar;
    }
    if (options.includeLowercase) {
      chars += options.excludeSimilar ? lowercase : lowercaseWithSimilar;
    }
    if (options.includeNumbers) {
      chars += options.excludeSimilar ? numbers : numbersWithSimilar;
    }
    if (options.includeSymbols) {
      chars += symbols;
    }

    if (chars.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      });
      return;
    }

    let generatedPassword = "";
    const array = new Uint32Array(options.length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < options.length; i++) {
      generatedPassword += chars[array[i] % chars.length];
    }

    setPassword(generatedPassword);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard (will auto-clear in 15s)",
      });

      // Auto-clear clipboard after 15 seconds
      setTimeout(() => {
        navigator.clipboard.writeText("");
      }, 15000);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Password Generator</h2>
          <p className="text-sm text-muted-foreground">
            Create strong, random passwords with customizable options
          </p>
        </div>

        {/* Generated Password Display */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={password}
              readOnly
              placeholder="Click generate to create password"
              className="flex h-14 w-full rounded-lg border border-input bg-card px-4 py-3 text-lg font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={copyToClipboard}
              disabled={!password}
              className="h-14 w-14 shrink-0"
            >
              {copied ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Password Length Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Password Length</Label>
            <span className="text-sm font-mono bg-muted px-3 py-1 rounded">
              {options.length}
            </span>
          </div>
          <Slider
            value={[options.length]}
            onValueChange={([value]) =>
              setOptions({ ...options, length: value })
            }
            min={8}
            max={32}
            step={1}
            className="w-full"
          />
        </div>

        {/* Character Type Options */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Character Types</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="uppercase" className="cursor-pointer">
                Uppercase Letters (A-Z)
              </Label>
              <Switch
                id="uppercase"
                checked={options.includeUppercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeUppercase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lowercase" className="cursor-pointer">
                Lowercase Letters (a-z)
              </Label>
              <Switch
                id="lowercase"
                checked={options.includeLowercase}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeLowercase: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="numbers" className="cursor-pointer">
                Numbers (0-9)
              </Label>
              <Switch
                id="numbers"
                checked={options.includeNumbers}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeNumbers: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="symbols" className="cursor-pointer">
                Symbols (!@#$%^&*)
              </Label>
              <Switch
                id="symbols"
                checked={options.includeSymbols}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeSymbols: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <Label htmlFor="exclude-similar" className="cursor-pointer">
                Exclude Similar Characters (0, O, 1, l, I)
              </Label>
              <Switch
                id="exclude-similar"
                checked={options.excludeSimilar}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, excludeSimilar: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generatePassword}
          className="w-full h-12 text-base font-medium gradient-primary"
          size="lg"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Generate Password
        </Button>
      </div>
    </Card>
  );
};

export default PasswordGenerator;
