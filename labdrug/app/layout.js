import './globals.css'

export const metadata = {
  title: 'Labdrug Pharmacy - Sales & Inventory Management',
  description: 'Pharmacy Sales and Inventory Management Information System for Labdrug Pharmacy, Isulan',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
