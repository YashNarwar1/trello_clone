"use client";

import { useEffect, useState } from "react";
import { Droppable, DragDropContext} from "@hello-pangea/dnd"

import { useAction } from "@/hooks/use-actions";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";

import { ListWithCards } from "@/types";
import { ListForm } from "./list-form";
import { ListItem } from "./list-item";
import { toast } from "sonner";

interface ListContainerProps {
    data: ListWithCards[];
    boardId: string;
};

function reorder<T>(list: T[] , startIndex: number, endIndex: number){
    const result = Array.from(list);
    const [removed ] = result.splice(startIndex , 1);
    result.splice(endIndex, 0 , removed);

    return result;
}

export const ListContainer = ({
     data,
     boardId,
}: ListContainerProps) => {
 
   const [ orderedData , setOrderedData] = useState(data)

   const {execute: executeUpdateListOrder } = useAction(updateListOrder , {
     onSuccess: () => {
      toast.success("List reordered");
     },
     onError: (error) => {
      toast.error(error);
     }
   })
  
   const {execute: executeUpdateCardOrder } = useAction(updateCardOrder , {
    onSuccess: () => {
     toast.success("Card reordered");
    },
    onError: (error) => {
     toast.error(error);
    }
  })

   useEffect(() => {
    setOrderedData(data);
   }, [data]);
  

   const onDragEnd = (result: any) => {
    const { destination , source , type } = result;
  
      if(!destination){
        return ;
      }
  
      // if user drops it in the same position it was before
      if(destination.droppableId === source.droppableId && 
         destination.index === source.index
        ) {
            return ;
        }

        // if user moves a list
      if(type === "list") {
          const items = reorder(
            orderedData,
            source.index,
            destination.index,
          ).map((item , index) => ({...item, order: index}));

          setOrderedData(items);
          executeUpdateListOrder({items, boardId});
      }

      if(type === "card") {
        let newOrderedData = [...orderedData];

       
        const sourceList = newOrderedData.find(list => list.id === source.droppableId)
        const destList = newOrderedData.find(list => list.id === destination.droppableId);
      

         if(!sourceList || !destList){
          return ;
         }

         // check if cards exists on the source list
         if(!sourceList.cards){
          sourceList.cards = [];
         }

         //check if cards exists on the destList
         if(!destList.cards ){
          destList.cards = [];
         }

         // Moving the card in the samelist 
         if(source.droppableId === destination.droppableId ){
          const reorderedCards = reorder(
            sourceList.cards,
            source.index,
            destination.index
         );

         reorderedCards.forEach((card, idx ) => {
          card.order = idx;

         });

         sourceList.cards = reorderedCards;

         setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          items: reorderedCards,
          boardId: boardId,
        })
         //User moves the card to another list
         } else {
             // remove card fromt the source list

             const [movedCard] = sourceList.cards.splice(source.index, 1);

            // Assign the new listId to the moved card
            movedCard.listId = destination.droppableId;
          
            //Add card to the destination list
          destList.cards.splice(destination.index, 0 , movedCard);

          sourceList.cards.forEach((card, idx) => {
            card.order = idx;
          });

          // update the order for each card in the destination list
          destList.cards.forEach((card,idx) => {
               card.order = idx;
          });

          setOrderedData(newOrderedData);

          executeUpdateCardOrder({
            boardId: boardId,
            items: destList.cards,
          })

         }

      }

   }

    return ( 
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="lists" type="list" direction="horizontal">
             {(provided) => (
           <ol className="flex gap-x-3 h-full"
           {...provided.droppableProps}
           ref={provided.innerRef}
           >
             {orderedData.map((list , index) => {
              return (
                <ListItem 
                 key={list.id}
                 index={index}
                 data={list}
                 
                />
            )
        })}      
                  {provided.placeholder}
                   <ListForm/>
               <div className="flex-shrink-0 w-1"/>
            </ol>
            )}
            </Droppable>
            </DragDropContext>
    )
}