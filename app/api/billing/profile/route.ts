import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getBillingProfile, upsertBillingProfile } from "@/db/billing_profile.db";
import { getUserById, updateUser } from "@/db/user.db";
import { getStateCodeFromName } from "@/services/billing.service";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getBillingProfile(session.userId);
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { name, phone, phone_country_code, gstin, company_name, address_line1, address_line2, city, state, pincode, country } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!phone?.trim()) return NextResponse.json({ error: "Phone is required" }, { status: 400 });
  if (!phone_country_code?.trim()) return NextResponse.json({ error: "Country code is required" }, { status: 400 });
  if (!state?.trim()) return NextResponse.json({ error: "State is required" }, { status: 400 });

  // If GSTIN provided, validate company details are present
  if (gstin?.trim()) {
    if (!company_name?.trim()) return NextResponse.json({ error: "Company name is required when GSTIN is provided" }, { status: 400 });
    if (!address_line1?.trim()) return NextResponse.json({ error: "Address is required when GSTIN is provided" }, { status: 400 });
    if (!city?.trim()) return NextResponse.json({ error: "City is required when GSTIN is provided" }, { status: 400 });
    if (!pincode?.trim()) return NextResponse.json({ error: "Pincode is required when GSTIN is provided" }, { status: 400 });
  }

  // state_code: from GSTIN first 2 digits (authoritative) or reverse-lookup from state name
  const state_code = gstin?.trim()
    ? gstin.trim().slice(0, 2)
    : getStateCodeFromName(state.trim());

  const user = await getUserById(session.userId);
  const userUpdates: Record<string, string> = {};
  if (!user?.name) userUpdates.name = name.trim();
  if (!user?.phone) userUpdates.phone = phone.trim();
  if (!user?.phone_country_code) userUpdates.phone_country_code = phone_country_code.trim();

  const [profile] = await Promise.all([
    upsertBillingProfile(session.userId, {
      name: name.trim(),
      phone: phone.trim(),
      phone_country_code: phone_country_code.trim(),
      country: country?.trim() || "IN",
      state: state.trim(),
      state_code,
      ...(gstin?.trim() ? {
        gstin: gstin.trim().toUpperCase(),
        company_name: company_name.trim(),
        address_line1: address_line1.trim(),
        address_line2: address_line2?.trim() || null,
        city: city.trim(),
        pincode: pincode.trim(),
      } : {
        gstin: null,
        company_name: null,
        address_line1: null,
        address_line2: null,
        city: null,
        pincode: null,
      }),
    }),
    Object.keys(userUpdates).length > 0 ? updateUser(session.userId, userUpdates) : Promise.resolve(null),
  ]);

  return NextResponse.json({ profile });
}
