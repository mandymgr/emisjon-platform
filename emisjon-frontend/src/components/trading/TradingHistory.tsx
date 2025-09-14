import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  History,
  Download,
  Search,
  CalendarIcon,
  MoreHorizontal,
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';
import { useTradeHistory } from '@/hooks/useTrading';
import { TradeStatus } from '@/types/trading';
import type { Trade } from '@/types/trading';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TradingHistoryProps {
  shareholderId?: string;
  compact?: boolean;
}

export function TradingHistory({ shareholderId, compact = false }: TradingHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'quantity'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filters = {
    shareholderId,
    from: dateFrom?.toISOString(),
    to: dateTo?.toISOString(),
  };

  const { data: trades, isLoading, refetch } = useTradeHistory(filters);

  const filteredTrades = trades?.filter(trade => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      trade.id.toLowerCase().includes(search) ||
      trade.buyOrderId?.toLowerCase().includes(search) ||
      trade.sellOrderId?.toLowerCase().includes(search)
    );
  }) || [];

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'amount':
        comparison = a.totalValue - b.totalValue;
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleExport = () => {
    const csv = [
      ['Trade ID', 'Date', 'Type', 'Quantity', 'Price', 'Total', 'Status'].join(','),
      ...sortedTrades.map(trade => [
        trade.id,
        format(new Date(trade.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        trade.tradeType,
        trade.quantity,
        trade.pricePerShare,
        trade.totalValue,
        trade.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const toggleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status: TradeStatus) => {
    const variants: Record<TradeStatus, any> = {
      [TradeStatus.PENDING]: 'secondary',
      [TradeStatus.PENDING_APPROVAL]: 'warning',
      [TradeStatus.COMPLETED]: 'success',
      [TradeStatus.REJECTED]: 'destructive',
      [TradeStatus.CANCELLED]: 'outline',
    };

    const colors: Record<TradeStatus, string> = {
      [TradeStatus.PENDING]: 'bg-yellow-500',
      [TradeStatus.PENDING_APPROVAL]: 'bg-orange-500',
      [TradeStatus.COMPLETED]: 'bg-green-500',
      [TradeStatus.REJECTED]: 'bg-red-500',
      [TradeStatus.CANCELLED]: 'bg-gray-500',
    };

    return (
      <Badge variant={variants[status] || 'default'} className="text-xs">
        <div className={cn("h-2 w-2 rounded-full mr-1", colors[status])} />
        {status}
      </Badge>
    );
  };

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CompactSkeleton />
          ) : sortedTrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trading history
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTrades.slice(0, 5).map((trade) => (
                <CompactTradeRow key={trade.id} trade={trade} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <History className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Trading History</span>
            <span className="sm:hidden">History</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="text-xs sm:text-sm"
            >
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={sortedTrades.length === 0}
              className="text-xs sm:text-sm"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-7 sm:pl-8 text-xs sm:text-sm h-8 sm:h-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px] h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value={TradeStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={TradeStatus.PENDING_APPROVAL}>Pending Approval</SelectItem>
                  <SelectItem value={TradeStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={TradeStatus.REJECTED}>Rejected</SelectItem>
                  <SelectItem value={TradeStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-8 sm:h-10 text-xs sm:text-sm">
                    <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {dateFrom ? format(dateFrom, 'MMM d') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-8 sm:h-10 text-xs sm:text-sm">
                    <CalendarIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    {dateTo ? format(dateTo, 'MMM d') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">ID</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('date')}
                      className="h-auto p-0 font-medium text-xs sm:text-sm"
                    >
                      Date
                      <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Type</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('quantity')}
                      className="h-auto p-0 font-medium text-xs sm:text-sm"
                    >
                      Qty
                      <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm hidden md:table-cell">Price</TableHead>
                  <TableHead className="text-xs sm:text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSort('amount')}
                      className="h-auto p-0 font-medium text-xs sm:text-sm"
                    >
                      Total
                      <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeleton />
                ) : sortedTrades.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No trades found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-mono text-[10px] sm:text-xs">
                        {trade.id.slice(0, 6)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-[10px] sm:text-xs">{format(new Date(trade.createdAt), 'MMM d')}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground">
                            {format(new Date(trade.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={trade.tradeType === 'FULL' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                          {trade.tradeType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{trade.quantity}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm">{formatCurrency(trade.pricePerShare)}</TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm">
                        {formatCurrency(trade.totalValue)}
                      </TableCell>
                      <TableCell>{getStatusBadge(trade.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Download Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompactTradeRow({ trade }: { trade: Trade }) {
  const isBuy = trade.buyerShareholderId === trade.buyOrderId;
  
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
      <div className="flex items-center gap-3">
        {isBuy ? (
          <TrendingUp className="h-4 w-4 text-green-600" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-600" />
        )}
        <div>
          <p className="text-sm font-medium">
            {trade.quantity} shares @ {formatCurrency(trade.pricePerShare)}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(trade.createdAt), 'dd MMM HH:mm')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{formatCurrency(trade.totalValue)}</p>
        <Badge variant="outline" className="text-xs scale-90">
          {trade.status}
        </Badge>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function CompactSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}