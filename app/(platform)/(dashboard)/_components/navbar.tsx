import { Plus } from "lucide-react";

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { MobileSidebar } from "./mobile-sidebar";

import { FormPopover } from "@/components/form/form-popover";

const Navbar = () => {
    return (
        <nav className="fixed top-0 bg-white h-14 w-full px-4 flex items-center z-50 shadow-sm " >
           <MobileSidebar/>
           
           
            <div className="flex items-center gap-x-4">
                <div className="hidden md:flex">
                    <Logo/>
                </div>
                <FormPopover align="start" side="bottom" sideOffset={18}>
                <Button variant="primary" size='sm' className="rounded-sm h-auto md:block hidden px-2 py-1.5 ">
                    Create
                </Button>
                </FormPopover>
                <FormPopover>
                <Button variant="primary" className="rounded-sm md:hidden border-black ">
                    <Plus className="h-4 w-4"/>
                </Button>
                </FormPopover>
            </div>
            <div className="ml-auto flex items-center gap-x-2">
               <OrganizationSwitcher
                 afterCreateOrganizationUrl="/organization/id"
                 afterLeaveOrganizationUrl="/select-org"
                 afterSelectOrganizationUrl="/organization/id"
                 appearance={{
                    elements: {
                        rootBox: {
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }
                    }
                 }}
               />
               <UserButton 
                 afterSignOutUrl="/"
                 appearance={{
                    elements: {
                        avatarBox: {
                            height: 30,
                            width: 30
                        }
                    }
                 }}
               />
            </div>
        </nav>
    )
}

export default Navbar;