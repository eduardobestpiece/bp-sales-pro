import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const colorClasses = {
  blue: "from-blue-500 to-blue-600 text-blue-500",
  green: "from-green-500 to-green-600 text-green-500", 
  purple: "from-purple-500 to-purple-600 text-purple-500",
  orange: "from-orange-500 to-orange-600 text-orange-500"
};

export default function MetricCard({ title, value, icon: Icon, color, trend, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-[#1C1C1C] border-[#656464]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 bg-[#656464]" />
            <Skeleton className="h-10 w-10 rounded-lg bg-[#656464]" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 bg-[#656464] mb-2" />
          <Skeleton className="h-4 w-16 bg-[#656464]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1C1C1C] border-[#656464] relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-[#9CA3AF]">{title}</p>
            <p className="text-2xl lg:text-3xl font-bold text-[#D9D9D9] mt-2 leading-none">
              {value}
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} bg-opacity-20 flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[2]}`} />
          </div>
        </div>
      </CardHeader>
      
      {trend && (
        <CardContent className="pt-0">
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
            <span className="text-green-500 font-medium">{trend}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}