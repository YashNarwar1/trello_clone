"use server"

import { auth, currentUser } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { StripeRedirect } from "./schema";
import { createSafeAction } from "@/lib/create-safe-actions";
import { createAuditLog } from "@/lib/create-audit-log";



import { InputType , ReturnType } from "./types";
import { isAbsoluteUrl } from "@/lib/utils";
import { stripe } from "@/lib/stripe";

const handler = async (data: InputType): Promise<ReturnType> => {
    const {userId, orgId} = auth();
    const user = await currentUser();
  
   if(!userId || !orgId || !user) {
    return {
        error: "Unauthorized"
    };
   } 

  const settingUrl = isAbsoluteUrl(`/organization/${orgId}`);

  let url = "";

  try {
    const orgSubscription = await db.orgSubscription.findUnique({
        where : {
            orgId,
        }
    });
 
    if(orgSubscription &&  orgSubscription.stripeCustomerId ) {
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: orgSubscription.stripeCustomerId,
            return_url: settingUrl,
        });

        url = stripeSession.url;
    } else {
        const stripeSession = await stripe.checkout.sessions.create({
           success_url: settingUrl,
           cancel_url: settingUrl,
           payment_method_types: ["card"],
           mode: "subscription",
           billing_address_collection: "auto",
           customer_email: user.emailAddresses[0].emailAddress, 
           line_items: [
            {
                price_data: {
                    currency: "INR",
                    product_data: {
                       name: "Taskify Pro",
                       description: "unlimited boards for your organization" 
                    },
                    unit_amount: 2000,
                    recurring: {
                        interval: "month"
                    },
                },
                quantity: 1,
            },
           ],
           metadata: {
            orgId,
           },
        });
      url: stripeSession.url || "";

    }

  } catch {
     return {
        error: "Something went wrong!"
     }
  }

   revalidatePath(`/organization/${orgId}`);
   return {data: url};
};

export const stripeRedirect = createSafeAction(StripeRedirect, handler);