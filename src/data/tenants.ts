import type { Tenant } from '../lib/types'

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString()

export const abcBakery: Tenant = {
  id: 't-abc',
  name: 'ABC Bakery Ltd',
  businessType: 'bakery',
  status: 'active',
  planId: 'professional',
  subscriptionEndsAt: daysAhead(21),
  joinedAt: daysAgo(140),
  aiCreditsUsed: 640,
  address: 'KN 3 Ave, Nyarugenge',
  city: 'Kigali',
  phone: '+250 788 123 456',
  email: 'info@abcbakery.rw',
  tin: '109876543',
  branches: [
    { id: 'b-kgl-ho', name: 'Kigali Production Facility', city: 'Kigali', isHeadOffice: true },
    { id: 'b-kgl-shop', name: 'Kigali Retail Shop', city: 'Kigali', isHeadOffice: false },
    { id: 'b-huye', name: 'Huye Branch', city: 'Huye', isHeadOffice: false },
    { id: 'b-mus', name: 'Musanze Branch', city: 'Musanze', isHeadOffice: false },
    { id: 'b-rub', name: 'Rubavu Branch', city: 'Rubavu', isHeadOffice: false },
  ],
  users: [
    { id: 'u-1', name: 'Jean Bosco Habimana', email: 'jean@abcbakery.rw', phone: '+250 788 123 456', role: 'owner', status: 'active', joinedAt: daysAgo(140) },
    { id: 'u-2', name: 'Alissa Uwase', email: 'alissa@abcbakery.rw', phone: '+250 788 234 567', role: 'manager', status: 'active', joinedAt: daysAgo(130) },
    { id: 'u-3', name: 'Eric Niyonsaba', email: 'eric@abcbakery.rw', phone: '+250 788 345 678', role: 'cashier', status: 'active', joinedAt: daysAgo(120) },
    { id: 'u-4', name: 'Claudine Mukamana', email: 'claudine@abcbakery.rw', phone: '+250 788 456 789', role: 'production', status: 'active', joinedAt: daysAgo(110) },
    { id: 'u-5', name: 'Patrick Mugisha', email: 'patrick@abcbakery.rw', phone: '+250 788 567 890', role: 'accountant', status: 'active', joinedAt: daysAgo(100) },
    { id: 'u-6', name: 'Diane Ingabire', email: 'diane@abcbakery.rw', phone: '+250 788 678 901', role: 'cashier', status: 'active', joinedAt: daysAgo(90) },
    { id: 'u-7', name: 'Samuel Byiringiro', email: 'samuel@abcbakery.rw', phone: '+250 788 789 012', role: 'production', status: 'invited' },
    { id: 'u-8', name: 'Grace Umuhoza', email: 'grace@abcbakery.rw', phone: '+250 788 890 123', role: 'accountant', status: 'active', joinedAt: daysAgo(60) },
    { id: 'u-9', name: 'Olivier Nshimiyimana', email: 'olivier@abcbakery.rw', phone: '+250 788 901 234', role: 'manager', status: 'active', joinedAt: daysAgo(45) },
  ],
}

export const imaneSupermarket: Tenant = {
  id: 't-imane',
  name: 'Imane Supermarket',
  businessType: 'supermarket',
  status: 'trial',
  planId: 'growth',
  trialEndsAt: daysAhead(11),
  subscriptionEndsAt: daysAhead(11),
  joinedAt: daysAgo(3),
  aiCreditsUsed: 12,
  address: 'KN 5 Rd, Kimironko',
  city: 'Kigali',
  phone: '+250 788 222 333',
  email: 'info@imanesupermarket.rw',
  branches: [{ id: 'b-im-1', name: 'Kimironko Branch', city: 'Kigali', isHeadOffice: true }],
  users: [
    { id: 'u-im-1', name: 'Fidele Nkurunziza', email: 'fidele@imanesupermarket.rw', phone: '+250 788 222 333', role: 'owner', status: 'active', joinedAt: daysAgo(3) },
    { id: 'u-im-2', name: 'Sandrine Uwimbabazi', email: 'sandrine@imanesupermarket.rw', phone: '+250 788 333 444', role: 'cashier', status: 'active', joinedAt: daysAgo(3) },
    { id: 'u-im-3', name: 'David Habimana', email: 'david@imanesupermarket.rw', phone: '+250 788 444 555', role: 'cashier', status: 'active', joinedAt: daysAgo(2) },
    { id: 'u-im-4', name: 'Chantal Uwera', email: 'chantal@imanesupermarket.rw', phone: '+250 788 555 666', role: 'manager', status: 'active', joinedAt: daysAgo(2) },
    { id: 'u-im-5', name: 'Joseph Nsengimana', email: 'joseph@imanesupermarket.rw', phone: '+250 788 666 777', role: 'production', status: 'invited' },
  ],
}

export const karibuCafe: Tenant = {
  id: 't-karibu',
  name: 'Karibu Café',
  businessType: 'restaurant',
  status: 'pending',
  planId: 'starter',
  subscriptionEndsAt: daysAhead(30),
  joinedAt: daysAgo(0),
  aiCreditsUsed: 0,
  address: 'KG 7 Ave, Kacyiru',
  city: 'Kigali',
  phone: '+250 788 777 888',
  email: 'hello@karibucafe.rw',
  branches: [{ id: 'b-kc-1', name: 'Kacyiru Branch', city: 'Kigali', isHeadOffice: true }],
  users: [
    { id: 'u-kc-1', name: 'Aline Mukeshimana', email: 'aline@karibucafe.rw', phone: '+250 788 777 888', role: 'owner', status: 'active', joinedAt: daysAgo(0) },
  ],
}

export const nzaLogistics: Tenant = {
  id: 't-nza',
  name: 'NZA Distribution Ltd',
  businessType: 'wholesaler',
  status: 'suspended',
  planId: 'professional',
  subscriptionEndsAt: daysAgo(9),
  joinedAt: daysAgo(210),
  aiCreditsUsed: 1300,
  address: 'Industrial Zone, Gikondo',
  city: 'Kigali',
  phone: '+250 788 999 000',
  email: 'ops@nzadist.rw',
  branches: [
    { id: 'b-nza-1', name: 'Gikondo Warehouse', city: 'Kigali', isHeadOffice: true },
    { id: 'b-nza-2', name: 'Huye Depot', city: 'Huye', isHeadOffice: false },
  ],
  users: [
    { id: 'u-nza-1', name: 'Robert Kayitare', email: 'robert@nzadist.rw', phone: '+250 788 999 000', role: 'owner', status: 'active', joinedAt: daysAgo(210) },
    { id: 'u-nza-2', name: 'Pacifique Uwimana', email: 'pacifique@nzadist.rw', phone: '+250 788 111 222', role: 'manager', status: 'inactive', joinedAt: daysAgo(180) },
  ],
}

export const TENANTS: Tenant[] = [abcBakery, imaneSupermarket, karibuCafe, nzaLogistics]