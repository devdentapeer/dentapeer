import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  return (
    <div className="container py-4 max-lg:px-4 mx-auto flex gap-4 items-center justify-between">
      <LoginForm />
    </div>
  );
}
