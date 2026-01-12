import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

interface CauseCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  category: string;
}

const CauseCard = ({ id, title, description, image, raised, goal, category }: CauseCardProps) => {
  const progress = (raised / goal) * 100;

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold rounded-full backdrop-blur-sm">
            {category}
          </span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-primary">${raised.toLocaleString()}</span>
            <span className="text-muted-foreground">of ${goal.toLocaleString()}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Link to={`/donate?cause=${id}`}>
          <Button variant="outline" className="w-full group-hover:variant-hero">
            <Heart className="w-4 h-4" />
            Donate Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CauseCard;
