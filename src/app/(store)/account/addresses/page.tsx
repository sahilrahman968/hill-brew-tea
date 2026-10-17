import { Metadata } from "next";
import AddressesClient from "./AddressesClient";

export const metadata: Metadata = {
  title: "Saved Addresses - Hill Brew Tea",
  description: "Manage your saved shipping addresses.",
};

export default function AddressesPage() {
  return <AddressesClient />;
}
