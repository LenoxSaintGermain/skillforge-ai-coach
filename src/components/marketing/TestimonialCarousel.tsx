
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialCarousel = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Product Manager",
      company: "TechSolutions Inc.",
      content: "SkillForge has completely transformed how I approach AI implementations. The personalized scenarios helped me apply theoretical knowledge to real business problems.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Data Scientist",
      company: "Analytics Pro",
      content: "As someone with technical AI expertise, I was impressed by how the scenarios challenged me to think beyond algorithms to actual implementation strategies.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Innovation Director",
      company: "FutureTech",
      content: "The AI coach provided invaluable feedback that helped me refine my approach to AI integration. I've seen substantial improvement in our team's implementation success rate.",
      rating: 4
    },
    {
      name: "David Wilson",
      role: "Business Analyst",
      company: "Strategic Insights",
      content: "I started with minimal AI knowledge, but the gradual progression of scenarios helped me build confidence. Now I'm leading our company's AI initiatives!",
      rating: 5
    }
  ];

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {testimonials.map((testimonial, index) => (
          <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card className="border shadow-md h-full">
                <CardContent className="flex flex-col p-6">
                  <div className="flex gap-1 mb-4">
                    {Array(5).fill(0).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm mb-6 flex-grow">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-8">
        <CarouselPrevious className="relative static transform-none mx-2" />
        <CarouselNext className="relative static transform-none mx-2" />
      </div>
    </Carousel>
  );
};

export default TestimonialCarousel;
