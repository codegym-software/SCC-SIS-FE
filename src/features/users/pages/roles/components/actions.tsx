import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Trash, UserPlus, Eye } from 'lucide-react';
import React from 'react';

interface RoleActionsProps {
    onEdit?: () => void;
    onDelete?: () => void;
    onAssign?: () => void;
    onViewDetails?: () => void;
}

const RoleActions: React.FC<RoleActionsProps> = ({ onEdit, onDelete, onAssign, onViewDetails }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center">
                    ⋯
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuGroup>
                    {onViewDetails && (
                        <DropdownMenuItem onClick={onViewDetails}>
                            <Eye size={14} />
                            <span>Thêm chi tiết</span>
                        </DropdownMenuItem>
                    )}
                    {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit size={14} />
                            <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                    )}
                    {onAssign && (
                        <DropdownMenuItem onClick={onAssign}>
                            <UserPlus size={14} />
                            <span>Gán vai trò</span>
                        </DropdownMenuItem>
                    )}
                    {onDelete && (
                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                            <Trash size={14} />
                            <span>Xóa vai trò</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default RoleActions;
