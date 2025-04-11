"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/libs/cities";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");
    const role = formData.get("role");
    const address = formData.get("address");
    const city = formData.get("city");
    const phone = formData.get("phone");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName: name,
          role,
          address,
          city,
          phone,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Kayıt hatası");
      }

      // Registration successful, redirect to login
      router.push("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-md mx-auto border shadow-sm rounded-xl">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-xl font-medium">
          Yeni bir hesap oluştur
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Hesabınızı oluşturmak için bilgilerinizi girin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Personal Information */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  İsim
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Dükkan Adınız"
                  className="mt-1"
                  required
                />
              </div>

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
                  placeholder="Parola (min. 8 karakter)"
                  className="mt-1"
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  En az 8 karakterli olmalı
                </p>
              </div>
            </div>

            <div className="pt-1">
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground text-center my-2 font-medium">
                Hesap Detayları
              </p>
              <Separator className="my-2" />
            </div>

            {/* Account Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="city" className="text-sm font-medium">
                  Şehir
                </Label>
                <Select name="city">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Şehir seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city, index) => (
                      <SelectItem key={index} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role" className="text-sm font-medium">
                  Mağaza Tipi
                </Label>
                <Select name="role">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Mağaza tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diş_kliniği">Diş Kliniği</SelectItem>
                    <SelectItem value="laboratuvar">Laboratuvar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Telefon
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Telefon numaranız"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium">
                  Adres
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Adresiniz"
                  className="resize-none mt-1 min-h-[80px]"
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
                <span>Hesap oluşturuluyor...</span>
              </div>
            ) : (
              "Hesap oluştur"
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Hesabınız var mı?{" "}
          <a
            href="/login"
            className="text-primary hover:underline underline-offset-2 transition-colors"
          >
            Giriş yap
          </a>
        </p>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/40 pt-4 pb-6">
        <p className="text-xs text-muted-foreground text-center max-w-sm">
          Hesap oluşturarak{" "}
          <a
            href="#"
            className="text-primary hover:underline underline-offset-2 transition-colors"
          >
            Kullanım Koşulları
          </a>{" "}
          ve{" "}
          <a
            href="#"
            className="text-primary hover:underline underline-offset-2 transition-colors"
          >
            Gizlilik Politikası
          </a>
          'nı kabul etmiş olursunuz
        </p>
      </CardFooter>
    </Card>
  );
}
