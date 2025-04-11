"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error cases
        switch (result.error) {
          case "CredentialsSignin":
            throw new Error("Email veya parola hatalı");
          default:
            throw new Error(result.error || "Giriş yapılırken bir hata oluştu");
        }
      }
      router.push("/clinic");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMagicLinkSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMagicLinkSent(false);

    const formData = new FormData(event.target);
    const email = formData.get("email");

    try {
      const result = await signIn("nodemailer", {
        email,
        redirect: false,
      });

      if (result?.error && result?.error === "AccessDenied") {
        throw new Error("Daha önce kaydolmadıysanız lütfen kayıt olunuz.");
      } else if (result?.error) {
        throw new Error(result.error || "Magic link gönderilemedi. Lütfen tekrar deneyin.");
      }

      setMagicLinkSent(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto border shadow-sm rounded-xl">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl font-medium">Giriş Yap</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Hesabınıza giriş yapmak için tercihinizi seçin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="password">Parola ile</TabsTrigger>
            <TabsTrigger value="magic">Magic Link ile</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email adresiniz"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      Parola
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Parolanız"
                      className="mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="text-sm mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Giriş yapılıyor...</span>
                  </div>
                ) : (
                  "Giriş Yap"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="magic">
            <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="magic-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="magic-email"
                    name="email"
                    type="email"
                    placeholder="Email adresiniz"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              {magicLinkSent && (
                <Alert className="text-sm mt-4">
                  <AlertDescription className="text-black">
                    Magic link email adresinize gönderildi. Lütfen email kutunuzu kontrol edin.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="text-sm mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading || magicLinkSent}
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Gönderiliyor...</span>
                  </div>
                ) : (
                  "Magic Link Gönder"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/40 pt-4 pb-6">
        <p className="text-xs text-muted-foreground text-center">
          Hesabınız yok mu?{" "}
          <a
            href="/register"
            className="text-primary hover:underline underline-offset-2 transition-colors"
          >
            Yeni hesap oluştur
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}
