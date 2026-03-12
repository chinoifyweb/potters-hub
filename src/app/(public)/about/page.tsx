import {
  Church,
  Target,
  Eye,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const leaders = [
  {
    name: "Pastor James Okafor",
    role: "Senior Pastor",
    bio: "Pastor James has led The Potter's House Church for over 15 years with a passion for teaching God's Word and building community.",
  },
  {
    name: "Pastor Grace Adeyemi",
    role: "Associate Pastor",
    bio: "Pastor Grace oversees worship ministry and women's ministry, bringing passion and creativity to everything she does.",
  },
  {
    name: "Minister David Eze",
    role: "Youth Pastor",
    bio: "Minister David leads our vibrant youth ministry, equipping the next generation to live boldly for Christ.",
  },
  {
    name: "Deaconess Sarah Nwosu",
    role: "Family Ministry Lead",
    bio: "Deaconess Sarah guides families through practical biblical teaching on marriage, parenting, and godly living.",
  },
];

const serviceTimes = [
  { day: "Sunday", services: ["Celebration Service: 8:00 AM"] },
  { day: "Tuesday", services: ["Revival Prayer Hour: 5:00 PM"] },
  { day: "2nd/3rd Sunday", services: ["School of Wealth Creation: 10:00 AM"] },
  { day: "Last Sunday", services: ["Singles & Married: 8:00 AM"] },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 to-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">About Us</h1>
          <p className="text-red-100 mt-3 max-w-xl mx-auto">
            Learn about our story, mission, and the people who make The Potter&apos;s House Church a
            vibrant community
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Church className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl font-bold">Our Story</h2>
          </div>
          <div className="prose prose-slate max-w-none text-muted-foreground space-y-4">
            <p>
              The Potter&apos;s House Church was founded in 2005 by Pastor James Okafor with a small
              group of 30 believers meeting in a rented community hall. What
              began as a humble gathering united by faith has grown into a
              thriving congregation of thousands.
            </p>
            <p>
              Over two decades, we have remained committed to our founding
              principles: preaching the uncompromised Word of God, cultivating
              authentic community, and reaching our city and the nations with the
              love of Christ. Today, The Potter&apos;s House Church serves
              Makurdi, Benue State and supports mission work in five countries.
            </p>
            <p>
              We believe that every person matters to God, and our doors are open
              to everyone -- regardless of background, age, or where they are on
              their spiritual journey. If you are looking for a place to belong,
              grow, and serve, you have found your church home.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Our Mission</h3>
              <p className="text-muted-foreground">
                To connect people with God and one another, equip believers for a
                life of purpose, and send them out to transform their world
                through the power of the Gospel.
              </p>
            </Card>
            <Card className="p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Our Vision</h3>
              <p className="text-muted-foreground">
                To be a church without walls -- a diverse, Spirit-filled
                community that influences every sphere of society with the values
                of the Kingdom of God, starting in Makurdi, Benue State and reaching the
                nations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Senior Pastor */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center shrink-0">
              <Users className="h-20 w-20 text-red-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Pastor James Okafor</h2>
              <p className="text-primary font-medium mt-1">
                Senior Pastor &amp; Founder
              </p>
              <p className="text-muted-foreground mt-4 leading-relaxed">
                Pastor James is a gifted teacher, author, and conference speaker
                with a heart for building people. He holds a Master of Divinity
                and has authored several books on Christian living. Together with
                his wife, he has dedicated his life to raising leaders and
                building a church that genuinely cares for its community. His
                teaching style combines deep theological insight with practical
                everyday application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Our Leadership Team</h2>
            <p className="text-muted-foreground mt-2">
              Meet the dedicated leaders who guide our church family
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {leaders.map((leader) => (
              <Card key={leader.name} className="text-center p-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-red-300" />
                </div>
                <h3 className="font-semibold">{leader.name}</h3>
                <p className="text-sm text-primary font-medium">
                  {leader.role}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {leader.bio}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Times & Location */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Service Times */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Service Times</h2>
              </div>
              <div className="space-y-4">
                {serviceTimes.map((item) => (
                  <Card key={item.day}>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{item.day}</h3>
                      {item.services.map((svc) => (
                        <p
                          key={svc}
                          className="text-sm text-muted-foreground mt-1"
                        >
                          {svc}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Our Locations</h2>
              </div>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">Main Church</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Welfare Quarters, Makurdi, Benue State
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
