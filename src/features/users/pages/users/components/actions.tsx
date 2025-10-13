import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../../../components/ui/dropdown-menu';
import { Eye, Pencil, ShieldOff, ShieldCheck, MoreHorizontal } from 'lucide-react';
import React from 'react';

interface UserActionsProps {
    onView?: () => void;
    onEdit?: () => void;
    onToggleStatus?: () => void;
    canEdit?: boolean;
    canToggleStatus?: boolean;
    isActive?: boolean;
}

const UserActions: React.FC<UserActionsProps> = ({ 
    onView, 
    onEdit, 
    onToggleStatus, 
    canEdit = true, 
    canToggleStatus = true, 
    isActive = true 
}) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center">
                <MoreHorizontal size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuGroup>
                    {onView && (
                        <DropdownMenuItem onClick={onView}>
                            <Eye size={14} />
                            <span>Xem chi tiết</span>
                        </DropdownMenuItem>
                    )}
                    {onEdit && canEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil size={14} />
                            <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                    )}
                    {onToggleStatus && canToggleStatus && (
                        <DropdownMenuItem onClick={onToggleStatus}>
                            {isActive ? (
                                <>
                                    <ShieldOff size={14} />
                                    <span>Vô hiệu hóa</span>
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={14} />
                                    <span>Kích hoạt</span>
                                </>
                            )}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserActions;
