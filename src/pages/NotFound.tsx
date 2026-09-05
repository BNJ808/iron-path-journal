import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <Seo
        title="Page introuvable — Carnet Muscu"
        description="Cette page n'existe pas ou a été déplacée. Retournez à votre carnet d'entraînement."
        path="/404"
      />
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">
          Oups ! Cette page est introuvable.
        </p>
        <a href="/" className="text-primary hover:underline underline">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;
