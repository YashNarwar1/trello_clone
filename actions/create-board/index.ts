"use server"

import { auth } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

import { createSafeAction } from "@/lib/create-safe-actions";
import { db } from "@/lib/db";
import { CreateBoard } from "./schema";


import { InputType, ReturnType } from "./types"
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { incrementAvailableCount , hasAvailableCount } from "@/lib/org-limit";

const handler = async (data : InputType): Promise<ReturnType> => {
    const { userId , orgId} = auth();
     
    if(!userId || !orgId) {
        return {
            error: "Unauthorized0,"
        };
    }

  const canCreate = await hasAvailableCount();

  if(!canCreate) {
    return {
        error: "You have reached your limit of free board, Please upgrade to create more."
    }
  }


    const { title , image} = data ;

    const [
     imageId,
     imageThumbUrl,
     imageFullUrl,
     imageLinkHTML,
     imageUserName
    ] = image.split("|")

   


  if(!imageId || !imageThumbUrl || !imageFullUrl || !imageLinkHTML || !imageUserName){
    return {
        error: "Missing fields. failed to create board."
    }
  }

    let board;

    try {
        board = await db.board.create({
            data: {
                title,
                orgId,
                imageId,
                imageLinkHTML,
                imageThumbUrl,
                imageUserName, 
                imageFullUrl
            }
        });

       
        await incrementAvailableCount()

        await createAuditLog({
            entityTitle: board.title,
            entityId: board.id,
            entityType: ENTITY_TYPE.BOARD,
            action: ACTION.CREATE,
           })
           

    } catch(error){
        return {
            error: "Failed to create."
        }
    }

    revalidatePath(`/board/${board.id}`);
    return { data : board};
}

export const createBoard = createSafeAction(CreateBoard, handler )

  