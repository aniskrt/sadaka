
import React from "react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";

interface SurahPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SurahPagination = ({ currentPage, totalPages, onPageChange }: SurahPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const pageNumber = i + 1;
          const isFirstPage = pageNumber === 1;
          const isLastPage = pageNumber === totalPages;
          const isCurrentPage = pageNumber === currentPage;
          const isNearCurrent = Math.abs(pageNumber - currentPage) <= 1;
          
          if (isFirstPage || isLastPage || isNearCurrent) {
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink 
                  isActive={isCurrentPage} 
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          } else if (pageNumber === 2 && currentPage > 3) {
            return <PaginationEllipsis key="ellipsis-start" />;
          } else if (pageNumber === totalPages - 1 && currentPage < totalPages - 2) {
            return <PaginationEllipsis key="ellipsis-end" />;
          }
          return null;
        })}
      </PaginationContent>
    </Pagination>
  );
};

export default SurahPagination;
