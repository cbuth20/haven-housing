'use client'

import { Fragment, ReactNode, useState, useRef, useCallback } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  hover?: boolean
}

// Click-based dropdown using HeadlessUI Menu
function ClickDropdown({ trigger, children }: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button as="div">
        {trigger}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {children}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

// Hover-based dropdown using plain state
function HoverDropdown({ trigger, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsOpen(true)
  }, [])

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150)
  }, [])

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <div className="cursor-pointer">{trigger}</div>

      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="absolute left-0 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {children}
          </div>
        </div>
      </Transition>
    </div>
  )
}

export function Dropdown({ trigger, children, hover = false }: DropdownProps) {
  if (hover) {
    return <HoverDropdown trigger={trigger}>{children}</HoverDropdown>
  }
  return <ClickDropdown trigger={trigger}>{children}</ClickDropdown>
}

interface DropdownItemProps {
  onClick?: () => void
  children: ReactNode
  icon?: React.ComponentType<{ className?: string }>
  danger?: boolean
}

export function DropdownItem({ onClick, children, icon: Icon, danger = false }: DropdownItemProps) {
  return (
    <Menu.Item>
      {({ active, close }) => (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onClick?.()
            close()
          }}
          className={`
            ${active ? 'bg-gray-100' : ''}
            ${danger ? 'text-red-600' : 'text-gray-700'}
            group flex w-full items-center px-4 py-2 text-sm
          `}
        >
          {Icon && <Icon className="mr-3 h-5 w-5" />}
          {children}
        </button>
      )}
    </Menu.Item>
  )
}

interface DropdownLinkProps {
  href: string
  children: ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

export function DropdownLink({ href, children, icon: Icon }: DropdownLinkProps) {
  return (
    <Menu.Item>
      {({ active }) => (
        <a
          href={href}
          className={`
            ${active ? 'bg-gray-100' : ''}
            text-gray-700 group flex items-center px-4 py-2 text-sm
          `}
        >
          {Icon && <Icon className="mr-3 h-5 w-5" />}
          {children}
        </a>
      )}
    </Menu.Item>
  )
}

// Standalone hover-friendly link (no HeadlessUI Menu context needed)
export function HoverDropdownLink({ href, children, icon: Icon }: DropdownLinkProps) {
  return (
    <a
      href={href}
      className="text-gray-700 hover:bg-gray-100 group flex items-center px-4 py-2 text-sm"
    >
      {Icon && <Icon className="mr-3 h-5 w-5" />}
      {children}
    </a>
  )
}
