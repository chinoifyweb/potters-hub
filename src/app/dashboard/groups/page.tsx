"use client"

import React, { useState } from "react"
import {
  Users,
  Search,
  MapPin,
  Clock,
  UserPlus,
  UserMinus,
  ChevronRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Group {
  id: string
  name: string
  description: string
  meetingDay: string
  meetingTime: string
  location: string
  memberCount: number
  category: string
  image?: string
  isMember: boolean
  leader: string
  members: { name: string; avatar?: string; initials: string }[]
}

const groups: Group[] = [
  {
    id: "1",
    name: "Men of Valor",
    description: "A fellowship group for men to grow in faith, accountability, and brotherhood. We study the Word and encourage one another in our walk with God.",
    meetingDay: "Saturday",
    meetingTime: "7:00 AM",
    location: "Room 201",
    memberCount: 28,
    category: "Men",
    isMember: true,
    leader: "Deacon Paul Mensah",
    members: [
      { name: "Paul Mensah", initials: "PM" },
      { name: "James Okonkwo", initials: "JO" },
      { name: "David Achebe", initials: "DA" },
      { name: "Emmanuel Nwosu", initials: "EN" },
    ],
  },
  {
    id: "2",
    name: "Women of Purpose",
    description: "A community of women committed to growing in grace. We meet weekly for Bible study, prayer, and fellowship.",
    meetingDay: "Wednesday",
    meetingTime: "10:00 AM",
    location: "Fellowship Hall",
    memberCount: 42,
    category: "Women",
    isMember: false,
    leader: "Sister Ruth Adebayo",
    members: [
      { name: "Ruth Adebayo", initials: "RA" },
      { name: "Grace Eze", initials: "GE" },
      { name: "Sarah Adeyemi", initials: "SA" },
    ],
  },
  {
    id: "3",
    name: "Youth Alive",
    description: "Young people on fire for God! We meet for worship, study, games, and outreach. Ages 13-25 welcome.",
    meetingDay: "Friday",
    meetingTime: "6:00 PM",
    location: "Youth Hall",
    memberCount: 65,
    category: "Youth",
    isMember: true,
    leader: "Pastor Grace Eze",
    members: [
      { name: "Grace Eze", initials: "GE" },
      { name: "Tunde Bakare", initials: "TB" },
      { name: "Chioma Obi", initials: "CO" },
      { name: "Kemi Adeyinka", initials: "KA" },
      { name: "Femi Johnson", initials: "FJ" },
    ],
  },
  {
    id: "4",
    name: "Prayer Warriors",
    description: "Dedicated intercessors who stand in the gap for the church, community, and nations. Join us in the ministry of prayer.",
    meetingDay: "Tuesday",
    meetingTime: "5:30 AM",
    location: "Prayer Room",
    memberCount: 19,
    category: "Prayer",
    isMember: false,
    leader: "Elder Mary Taiwo",
    members: [
      { name: "Mary Taiwo", initials: "MT" },
      { name: "Joseph Okafor", initials: "JOk" },
    ],
  },
  {
    id: "5",
    name: "Couples Connect",
    description: "Strengthening marriages through the Word of God. A safe space for couples to learn, share, and grow together.",
    meetingDay: "Sunday",
    meetingTime: "4:00 PM",
    location: "Room 105",
    memberCount: 24,
    category: "Family",
    isMember: false,
    leader: "Pastor James & Sister Ngozi Okonkwo",
    members: [
      { name: "James Okonkwo", initials: "JO" },
      { name: "Ngozi Okonkwo", initials: "NO" },
    ],
  },
  {
    id: "6",
    name: "Creative Arts Team",
    description: "For musicians, singers, dancers, and media creatives who use their talents for God's glory in worship and outreach.",
    meetingDay: "Thursday",
    meetingTime: "7:00 PM",
    location: "Main Sanctuary",
    memberCount: 35,
    category: "Ministry",
    isMember: true,
    leader: "Brother Tayo Adesina",
    members: [
      { name: "Tayo Adesina", initials: "TA" },
      { name: "Bisi Ogun", initials: "BO" },
      { name: "Ada Nweke", initials: "AN" },
    ],
  },
]

const categoryColors: Record<string, string> = {
  Men: "bg-red-100 text-red-700",
  Women: "bg-pink-100 text-pink-700",
  Youth: "bg-green-100 text-green-700",
  Prayer: "bg-purple-100 text-purple-700",
  Family: "bg-amber-100 text-amber-700",
  Ministry: "bg-rose-100 text-rose-700",
}

export default function GroupsPage() {
  const [groupList, setGroupList] = useState(groups)
  const [search, setSearch] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("my-groups")

  const toggleMembership = (groupId: string) => {
    setGroupList((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newStatus = !g.isMember
          toast.success(newStatus ? `Joined "${g.name}"` : `Left "${g.name}"`)
          return {
            ...g,
            isMember: newStatus,
            memberCount: newStatus ? g.memberCount + 1 : g.memberCount - 1,
          }
        }
        return g
      })
    )
  }

  const myGroups = groupList.filter((g) => g.isMember)
  const discoverGroups = groupList.filter((g) => {
    if (search) {
      return (
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase())
      )
    }
    return true
  })

  const detail = selectedGroup ? groupList.find((g) => g.id === selectedGroup) : null

  if (detail) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={() => setSelectedGroup(null)}>
          <ChevronRight className="h-4 w-4 rotate-180" /> Back to Groups
        </Button>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{detail.name}</h2>
                <Badge className={cn("mt-1 text-xs", categoryColors[detail.category] || "")}>
                  {detail.category}
                </Badge>
              </div>
              <Button
                variant={detail.isMember ? "outline" : "default"}
                size="sm"
                onClick={() => toggleMembership(detail.id)}
              >
                {detail.isMember ? (
                  <><UserMinus className="h-4 w-4 mr-1.5" /> Leave</>
                ) : (
                  <><UserPlus className="h-4 w-4 mr-1.5" /> Join</>
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{detail.description}</p>

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{detail.meetingDay}s at {detail.meetingTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{detail.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{detail.memberCount} members</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-1">Led by</p>
              <p className="text-sm text-muted-foreground">{detail.leader}</p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Members</p>
              <div className="flex flex-wrap gap-3">
                {detail.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="text-[10px]">{m.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{m.name}</span>
                  </div>
                ))}
                {detail.memberCount > detail.members.length && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{detail.memberCount - detail.members.length} more
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Groups</h2>
        <p className="text-muted-foreground">Connect with others through small groups and fellowships.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-groups">
            My Groups
            {myGroups.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 min-w-[20px] px-1 text-[10px]">
                {myGroups.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="mt-4">
          {myGroups.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">You have not joined any groups yet.</p>
              <Button variant="outline" className="mt-3" onClick={() => setActiveTab("discover")}>
                Discover Groups
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <Card
                  key={group.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <Badge className={cn("text-[10px]", categoryColors[group.category] || "")}>
                        {group.category}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{group.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {group.meetingDay}s {group.meetingTime}
                      </span>
                      <span>{group.memberCount} members</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverGroups.map((group) => (
              <Card
                key={group.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedGroup(group.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <Badge className={cn("text-[10px]", categoryColors[group.category] || "")}>
                      {group.category}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{group.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{group.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {group.location}
                    </span>
                    <span>{group.memberCount} members</span>
                  </div>
                  <Button
                    size="sm"
                    variant={group.isMember ? "outline" : "default"}
                    className="w-full text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMembership(group.id)
                    }}
                  >
                    {group.isMember ? "Leave Group" : "Join Group"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
