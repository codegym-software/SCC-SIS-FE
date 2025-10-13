import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../../../components/ui/dropdown-menu';
import { Edit, Eye, Trash, Power, PowerOff, MoreHorizontal } from 'lucide-react';
import React from 'react';

interface CenterActionsProps {
    center: {
        id: number;
        name: string;
        active: boolean;
    };
    onView?: () => void;
    onEdit?: () => void;
    onToggleStatus?: () => void;
    onDelete?: () => void;
    canEdit?: boolean;
    canDelete?: boolean;
    canToggleStatus?: boolean;
}

const CenterActions: React.FC<CenterActionsProps> = ({ 
    center, 
    onView, 
    onEdit, 
    onToggleStatus, 
    onDelete,
    canEdit = true,
    canDelete = true,
    canToggleStatus = true
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
                            <Edit size={14} />
                            <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                    )}
                    {onToggleStatus && canToggleStatus && (
                        <DropdownMenuItem onClick={onToggleStatus}>
                            {center.active ? (
                                <>
                                    <PowerOff size={14} />
                                    <span>Vô hiệu hóa</span>
                                </>
                            ) : (
                                <>
                                    <Power size={14} />
                                    <span>Kích hoạt</span>
                                </>
                            )}
                        </DropdownMenuItem>
                    )}
                    {onDelete && canDelete && (
                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                            <Trash size={14} />
                            <span>Xóa trung tâm</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CenterActions;
