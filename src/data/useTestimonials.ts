export interface ReviewData { id: number; title: string; description: string; rating: number; reviewerName: string; reviewerContext: string; avatar: string; imageSrc: string; }

export const REVIEWS: ReviewData[] = [
    {
        id: 1,
        title: "Outstanding product quality and support",
        description:
            "The final deliverable was polished and reliable. Communication stayed clear at every step and timelines were met consistently.",
        rating: 5,
        reviewerName: "Jayesh Patil",
        reviewerContext: "CEO, Lirante",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
        imageSrc: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Execution was fast and highly professional",
        description:
            "From strategy to implementation, every phase was handled with technical depth and strong attention to detail.",
        rating: 5,
        reviewerName: "Ananya Krishnan",
        reviewerContext: "Product Manager, Taskify",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300&auto=format&fit=crop",
        imageSrc: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "A rare blend of design and engineering",
        description:
            "The UI looked premium while the underlying architecture remained clean, scalable, and production-focused.",
        rating: 5,
        reviewerName: "Rahul Menon",
        reviewerContext: "CTO, Medivo",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
        imageSrc: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 4,
        title: "Reliable delivery even under pressure",
        description:
            "Complex requirements were simplified into clear milestones. Every update improved the product in measurable ways.",
        rating: 5,
        reviewerName: "Priya Sharma",
        reviewerContext: "Founder, Finora",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=300&auto=format&fit=crop",
        imageSrc: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 5,
        title: "Smooth collaboration and top-tier outcomes",
        description:
            "What stood out most was ownership. Problems were solved proactively, and the final output exceeded our target quality.",
        rating: 5,
        reviewerName: "Vikram Nair",
        reviewerContext: "Lead Engineer, IotrixLabs",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop",
        imageSrc: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1000&auto=format&fit=crop",
    },
    {
        id: 6,
        title: "Creative direction with strong technical grounding",
        description:
            "Design decisions were always backed by user flow logic and implementation feasibility. The process felt seamless.",
        rating: 5,
        reviewerName: "Deepika Rajan",
        reviewerContext: "Design Director, Pixelhaus",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
        imageSrc: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1000&auto=format&fit=crop",
    },
];