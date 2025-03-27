"use server"

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { CopyList } from "./schema";
import { createSafeAction } from "@/lib/create-safe-actions";



import { InputType , ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
    const {userId, orgId} = auth();
  
   if(!userId || !orgId) {
    return {
        error: "Unauthorized"
    };
   } 

   const {  id , boardId } = data;
   let list;

   try {
   const listTocopy = await db.list.findUnique({
    where: {
        id,
        boardId,
        board: {
            orgId
        },
    },
    include: {
        cards: true,
    },
   });

   if(!listTocopy)  {
    return { error: "List not found!"}
   }  
  
   const lastList = await db.list.findFirst({
    where: { boardId},
    orderBy: {order: "desc"},
    select: { order: true},
   })

   const newOrder = lastList ? lastList.order + 1 : 1;
 
   list = await db.list.create({
    data: {
        boardId: listTocopy.boardId,
        title: `${listTocopy.title} - Copy`,
        order: newOrder,
        cards: {
            createMany: {
                data: listTocopy.cards.map((card) => ({
                    title: card.title,
                    description: card.description,
                    order: card.order,
                })),
            },
        },
    },
    include: {
        cards : true,
    }
   })

   await createAuditLog({
    entityTitle: list.title,
    entityId: list.id,
    entityType: ENTITY_TYPE.LIST,
    action: ACTION.CREATE,
   })
   
   } catch (error) {
     return {
        error : "Failed to copy."
     }
   }

   revalidatePath(`/board/${boardId}`);
    return { data: list};
}


export const copyList = createSafeAction(CopyList, handler);