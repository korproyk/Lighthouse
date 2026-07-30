import type { AdminRegion, LocalArea, LocalAreaType } from './types';

const L = (
  id: string,
  type: LocalAreaType,
  en: string,
  bn: string,
  lat: number,
  lng: number
): LocalArea => ({ id, type, names: { en, bn }, lat, lng });

const region = (
  id: string,
  en: string,
  bn: string,
  localAreas: LocalArea[]
): AdminRegion => ({
  id,
  countryId: 'bangladesh',
  names: { en, bn },
  localAreas,
});

/**
 * Bangladesh divisions → districts (existing Community geography support).
 * Expandable without changing the selector component.
 */
export const BANGLADESH_REGIONS: AdminRegion[] = [
  region('dhaka-division', 'Dhaka Division', 'ঢাকা বিভাগ', [
    L('dhaka-district', 'district', 'Dhaka', 'ঢাকা', 23.8103, 90.4125),
    L('gazipur', 'district', 'Gazipur', 'গাজীপুর', 23.9999, 90.4203),
    L('narayanganj', 'district', 'Narayanganj', 'নারায়ণগঞ্জ', 23.6238, 90.5000),
    L('tangail', 'district', 'Tangail', 'টাঙ্গাইল', 24.2513, 89.9167),
    L('kishoreganj', 'district', 'Kishoreganj', 'কিশোরগঞ্জ', 24.4449, 90.7766),
    L('manikganj', 'district', 'Manikganj', 'মানিকগঞ্জ', 23.8617, 90.0000),
    L('munshiganj', 'district', 'Munshiganj', 'মুন্সিগঞ্জ', 23.5422, 90.5305),
    L('narsingdi', 'district', 'Narsingdi', 'নরসিংদী', 23.9322, 90.7150),
    L('rajbari', 'district', 'Rajbari', 'রাজবাড়ী', 23.7574, 89.6440),
    L('shariatpur', 'district', 'Shariatpur', 'শরীয়তপুর', 23.2423, 90.4348),
    L('madaripur', 'district', 'Madaripur', 'মাদারীপুর', 23.1641, 90.1897),
    L('gopalganj-bd', 'district', 'Gopalganj', 'গোপালগঞ্জ', 23.0051, 89.8266),
    L('faridpur', 'district', 'Faridpur', 'ফরিদপুর', 23.6071, 89.8420),
  ]),
  region('chattogram-division', 'Chattogram Division', 'চট্টগ্রাম বিভাগ', [
    L('chattogram', 'district', 'Chattogram', 'চট্টগ্রাম', 22.3569, 91.7832),
    L('cox-bazar', 'district', "Cox's Bazar", 'কক্সবাজার', 21.4272, 92.0058),
    L('comilla', 'district', 'Cumilla', 'কুমিল্লা', 23.4607, 91.1809),
    L('feni', 'district', 'Feni', 'ফেনী', 23.0159, 91.3976),
    L('noakhali', 'district', 'Noakhali', 'নোয়াখালী', 22.8696, 91.0995),
    L('lakshmipur', 'district', 'Lakshmipur', 'লক্ষ্মীপুর', 22.9447, 90.8282),
    L('chandpur', 'district', 'Chandpur', 'চাঁদপুর', 23.2513, 90.6517),
    L('brahmanbaria', 'district', 'Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 23.9608, 91.1115),
  ]),
  region('rajshahi-division', 'Rajshahi Division', 'রাজশাহী বিভাগ', [
    L('rajshahi', 'district', 'Rajshahi', 'রাজশাহী', 24.3745, 88.6042),
    L('bogura', 'district', 'Bogura', 'বগুড়া', 24.8465, 89.3770),
    L('pabna', 'district', 'Pabna', 'পাবনা', 24.0064, 89.2372),
    L('sirajganj', 'district', 'Sirajganj', 'সিরাজগঞ্জ', 24.4534, 89.7007),
    L('natore', 'district', 'Natore', 'নাটোর', 24.4206, 89.0000),
    L('naogaon', 'district', 'Naogaon', 'নওগাঁ', 24.7936, 88.9318),
    L('chapainawabganj', 'district', 'Chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 24.7413, 88.2912),
    L('joypurhat', 'district', 'Joypurhat', 'জয়পুরহাট', 25.0947, 89.0236),
  ]),
  region('khulna-division', 'Khulna Division', 'খুলনা বিভাগ', [
    L('khulna', 'district', 'Khulna', 'খুলনা', 22.8456, 89.5403),
    L('jessore', 'district', 'Jashore', 'যশোর', 23.1667, 89.2089),
    L('kushtia', 'district', 'Kushtia', 'কুষ্টিয়া', 23.9013, 89.1200),
    L('satkhira', 'district', 'Satkhira', 'সাতক্ষীরা', 22.7185, 89.0705),
    L('bagerhat', 'district', 'Bagerhat', 'বাগেরহাট', 22.6602, 89.7895),
  ]),
  region('barishal-division', 'Barishal Division', 'বরিশাল বিভাগ', [
    L('barishal', 'district', 'Barishal', 'বরিশাল', 22.7010, 90.3535),
    L('patuakhali', 'district', 'Patuakhali', 'পটুয়াখালী', 22.3596, 90.3299),
    L('bhola', 'district', 'Bhola', 'ভোলা', 22.6853, 90.6482),
  ]),
  region('sylhet-division', 'Sylhet Division', 'সিলেট বিভাগ', [
    L('sylhet', 'district', 'Sylhet', 'সিলেট', 24.8949, 91.8687),
    L('moulvibazar', 'district', 'Moulvibazar', 'মৌলভীবাজার', 24.4821, 91.7773),
    L('habiganj', 'district', 'Habiganj', 'হবিগঞ্জ', 24.3740, 91.4155),
    L('sunamganj', 'district', 'Sunamganj', 'সুনামগঞ্জ', 25.0657, 91.3950),
  ]),
  region('rangpur-division', 'Rangpur Division', 'রংপুর বিভাগ', [
    L('rangpur', 'district', 'Rangpur', 'রংপুর', 25.7439, 89.2752),
    L('dinajpur', 'district', 'Dinajpur', 'দিনাজপুর', 25.6279, 88.6332),
    L('kurigram', 'district', 'Kurigram', 'কুড়িগ্রাম', 25.8072, 89.6295),
    L('lalmonirhat', 'district', 'Lalmonirhat', 'লালমনিরহাট', 25.9163, 89.4455),
  ]),
  region('mymensingh-division', 'Mymensingh Division', 'ময়মনসিংহ বিভাগ', [
    L('mymensingh', 'district', 'Mymensingh', 'ময়মনসিংহ', 24.7471, 90.4203),
    L('jamalpur', 'district', 'Jamalpur', 'জামালপুর', 24.9375, 89.9370),
    L('netrokona', 'district', 'Netrokona', 'নেত্রকোণা', 24.8700, 90.7270),
    L('sherpur', 'district', 'Sherpur', 'শেরপুর', 25.0205, 90.0153),
  ]),
];
