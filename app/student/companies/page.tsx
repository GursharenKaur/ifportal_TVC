"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/lib/store/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, MapPin, Briefcase, ChevronRight, Filter } from "lucide-react"

export default function CompaniesPage() {
  const { token, _hasHydrated } = useAuthStore()
  const [companies, setCompanies] = useState<any[]>([])
  const [roles, setRoles] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState("All")

  useEffect(() => {
    if (!token) return

    // Fetch companies
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/student/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched companies:", data)
        const companyList = Array.isArray(data) ? data : []
        setCompanies(companyList)

        // Extract unique roles from the companies
        const uniqueRoles = Array.from(new Set(
          companyList.flatMap(company =>
            company.roles ? company.roles.map((r: any) => r.title) : []
          )
        )).sort()

        setRoles(uniqueRoles as string[])
      })
      .catch(err => console.error("Failed to fetch companies:", err))
  }, [token])

  const filtered = companies.filter(c => {
    if (selectedRole === "All") return true
    return c.roles && c.roles.some((r: any) => r.title === selectedRole)
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partner Companies</h1>
          <p className="text-muted-foreground mt-1">Discover opportunities based on your preferred role</p>
        </div>
        <div className="relative w-full md:w-96">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full h-11 bg-muted/20 border-muted-foreground/20 focus:bg-background transition-all">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Select a role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 border-2 border-dashed rounded-2xl text-center bg-muted/10">
            <p className="text-muted-foreground">No companies found matching the selected role.</p>
          </div>
        ) : (
          filtered.map(company => {
            const logoUrl = company.logo
              ? (company.logo.startsWith('http') ? company.logo : `${process.env.NEXT_PUBLIC_BACKEND_URL}${company.logo}`)
              : "https://via.placeholder.com/150?text=Company"

            return (
              <Link key={company._id} href={`/student/companies/${company._id}`}>
                <Card className="group h-full flex flex-col hover:shadow-xl hover:border-primary/40 transition-all duration-300 overflow-hidden bg-gradient-to-br from-background to-muted/20">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    <div className="h-14 w-14 rounded-xl border bg-white p-2 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={logoUrl}
                        alt={company.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Logo")}
                      />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors truncate">
                        {company.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{company.location || company.address?.city || "Remote"}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div>
                      <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        <Briefcase className="h-3 w-3" />
                        Available Roles
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {company.roles && company.roles.length > 0 ? (
                          company.roles.slice(0, 3).map((role: any) => (
                            <Badge key={role._id} variant="secondary" className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10 transition-colors">
                              {role.title}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No active roles</span>
                        )}
                        {company.roles && company.roles.length > 3 && (
                          <Badge variant="outline" className="border-dashed">
                            +{company.roles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-sm font-semibold text-primary/80 group-hover:text-primary">
                      <span>View Details</span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
