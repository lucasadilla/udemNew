"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { useEditMode } from "@/contexts/edit-mode";

type EventItem = {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
};

export function EventsClient() {
  const { canEdit, isEditMode } = useEditMode();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const fullCalendarEvents = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startDate,
    end: e.endDate ?? undefined,
    extendedProps: { description: e.description },
  }));

  function handleEventClick(info: { event: { id: string } }) {
    const e = events.find((ev) => ev.id === info.event.id);
    if (e) setSelectedEvent(e);
  }

  function openAddModal() {
    setEditingId("new");
    const now = new Date();
    setForm({
      title: "",
      description: "",
      startDate: now.toISOString().slice(0, 10),
      startTime: "09:00",
      endDate: "",
      endTime: "",
    });
    setModalOpen(true);
  }

  function openEditModal(e: EventItem) {
    setEditingId(e.id);
    const start = new Date(e.startDate);
    const end = e.endDate ? new Date(e.endDate) : null;
    setForm({
      title: e.title,
      description: e.description ?? "",
      startDate: start.toISOString().slice(0, 10),
      startTime: start.toTimeString().slice(0, 5),
      endDate: end ? end.toISOString().slice(0, 10) : "",
      endTime: end ? end.toTimeString().slice(0, 5) : "",
    });
    setModalOpen(true);
  }

  async function submitEvent() {
    const start = new Date(`${form.startDate}T${form.startTime}`);
    const end =
      form.endDate && form.endTime
        ? new Date(`${form.endDate}T${form.endTime}`)
        : null;

    if (editingId === "new") {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          startDate: start.toISOString(),
          endDate: end?.toISOString() ?? null,
        }),
      });
    } else {
      await fetch("/api/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: form.title,
          description: form.description || null,
          startDate: start.toISOString(),
          endDate: end?.toISOString() ?? null,
        }),
      });
    }
    setModalOpen(false);
    await load();
  }

  async function deleteEvent(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    await fetch(`/api/events?id=${id}`, { method: "DELETE" });
    setSelectedEvent(null);
    setModalOpen(false);
    await load();
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-500">Chargement…</p>
      </div>
    );
  }

  return (
    <main className="w-full px-4 py-12 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
          Événements
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Agenda des activités et événements du comité
        </p>
      </header>

      <div className="events-calendar-theme events-calendar-mobile mx-auto max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-[#f5e6e8] p-4">
        <div className="events-calendar-scroll min-w-0 overflow-x-auto overflow-y-visible">
          <div className="min-w-[280px]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={frLocale}
            events={fullCalendarEvents}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek",
            }}
            height="auto"
            contentHeight="auto"
          />
          </div>
        </div>
      </div>

      {canEdit && isEditMode && (
        <div className="mt-6">
          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-slate-800 px-4 py-2 text-white"
          >
            + Ajouter un événement
          </button>
        </div>
      )}

      {/* Detail modal (when user clicks event) */}
      {selectedEvent && !modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold">{selectedEvent.title}</h2>
            <p className="mt-2 text-slate-600">
              {new Date(selectedEvent.startDate).toLocaleString("fr-CA")}
              {selectedEvent.endDate &&
                ` – ${new Date(selectedEvent.endDate).toLocaleString("fr-CA")}`}
            </p>
            {selectedEvent.description && (
              <p className="mt-4 text-slate-600">{selectedEvent.description}</p>
            )}
            <div className="mt-6 flex gap-2">
              {canEdit && isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEvent(null);
                    openEditModal(selectedEvent);
                  }}
                  className="rounded bg-slate-800 px-4 py-2 text-white"
                >
                  Modifier
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="rounded border border-slate-300 px-4 py-2"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">
              {editingId === "new" ? "Nouvel événement" : "Modifier"}
            </h2>
            <div className="mt-4 flex flex-col gap-3">
              <input
                placeholder="Titre"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                className="rounded border border-slate-300 px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startDate: e.target.value }))
                  }
                  className="rounded border border-slate-300 px-3 py-2"
                />
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startTime: e.target.value }))
                  }
                  className="rounded border border-slate-300 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  placeholder="Fin (optionnel)"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endDate: e.target.value }))
                  }
                  className="rounded border border-slate-300 px-3 py-2"
                />
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endTime: e.target.value }))
                  }
                  className="rounded border border-slate-300 px-3 py-2"
                />
              </div>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="rounded border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={submitEvent}
                className="rounded bg-slate-800 px-4 py-2 text-white"
              >
                Enregistrer
              </button>
              {editingId !== "new" && (
                <button
                  type="button"
                  onClick={() =>
                    editingId && deleteEvent(editingId).then(() => setModalOpen(false))
                  }
                  className="rounded bg-red-600 px-4 py-2 text-white"
                >
                  Supprimer
                </button>
              )}
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded border border-slate-300 px-4 py-2"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
