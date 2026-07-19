import { Injectable, NotFoundException } from "@nestjs/common";

export type SnaggingTicket = {
  id: string;
  propertyId: string;
  userId: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved";
  photoUrl?: string;
  createdAt: string;
};

@Injectable()
export class OwnerCareService {
  private tickets: SnaggingTicket[] = [
    {
      id: "ticket-1",
      propertyId: "residence-1204",
      userId: "user-1",
      title: "Scratched floor in master bedroom",
      description: "There is a deep scratch near the balcony door.",
      status: "open",
      createdAt: new Date().toISOString()
    }
  ];

  getTicketsByProperty(propertyId: string): SnaggingTicket[] {
    return this.tickets.filter((t) => t.propertyId === propertyId);
  }

  createTicket(data: Omit<SnaggingTicket, "id" | "createdAt" | "status">): SnaggingTicket {
    const newTicket: SnaggingTicket = {
      id: `ticket-${Math.random().toString(36).substring(7)}`,
      ...data,
      status: "open",
      createdAt: new Date().toISOString(),
    };
    this.tickets.push(newTicket);
    return newTicket;
  }

  updateTicketStatus(ticketId: string, status: SnaggingTicket["status"]): SnaggingTicket {
    const ticket = this.tickets.find((t) => t.id === ticketId);
    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }
    ticket.status = status;
    return ticket;
  }
}
