import {
Tooltip, TooltipContent, TooltipTrigger, TooltipProvider
} from "@/components/ui/tooltip"


interface HintProps {
    children: React.ReactNode;
    description: string;
    side?: "left" | "right" | "top" | "bottom";
    sideOffset?: number;
}

export const  Hint = ({
 children, description, side="bottom" , sideOffset = 0
}: HintProps) => {
 return (
    <TooltipProvider>
        <Tooltip delayDuration={0}>
             <TooltipTrigger>
                {children}
             </TooltipTrigger>
             <TooltipContent side={side} sideOffset={sideOffset} className="text-xm max-w-[220px] break-words">
                {description}
             </TooltipContent>
        </Tooltip>
    </TooltipProvider>
 )
}