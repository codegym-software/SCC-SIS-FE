import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../../../../components/ui/dropdown-menu';
import { Edit, Eye, Trash, MoreHorizontal, ListOrdered } from 'lucide-react';
import React from 'react';

interface ProgramActionsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onManageModules?: () => void;
}

const ProgramActions: React.FC<ProgramActionsProps> = ({ onView, onEdit, onDelete, onManageModules }) => {
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
                            <span>Đề cương</span>
                        </DropdownMenuItem>
                    )}
                    {onManageModules && (
                        <DropdownMenuItem onClick={onManageModules}>
                            <ListOrdered size={14} />
                            <span>Sắp xếp modules</span>
                        </DropdownMenuItem>
                    )}
                    {onEdit && (
                        <DropdownMenuItem onClick={onEdit}>
                            <Edit size={14} />
                            <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                    )}
                    {onDelete && (
                        <DropdownMenuItem onClick={onDelete} className="text-red-600">
                            <Trash size={14} />
                            <span>Xóa chương trình</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ProgramActions;
