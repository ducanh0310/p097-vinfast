"use client";

import { useState } from "react";
import { useConfigurator } from "@/hooks/use-configurator";
import { useChat } from "@/hooks/use-chat";
import { SelectorPanel } from "@/components/configurator/selector-panel";
import { PricingPanel } from "@/components/configurator/pricing-panel";
import { ChatPanel } from "@/components/configurator/chat-panel";
import { Header } from "@/components/shared/header";
import { BuyerIdentityModal } from "@/components/shared/buyer-identity-modal";
import { VEHICLES } from "@/lib/vehicle-data";

export default function ConfiguratorPage() {
  const configurator = useConfigurator();
  const chat         = useChat();
  const [showModal, setShowModal] = useState(false);

  const { config, pricing } = configurator;
  const vehicle = VEHICLES[config.model];

  const carConfigText = `${vehicle.label} ${pricing.version.label} · ${pricing.color.label} · ${pricing.province.label}`;
  const selectedVehicleContext = {
    model: vehicle.label,
    version: pricing.version.label,
    color: pricing.color.label,
    province: pricing.province.label,
    battery: config.battery,
    accessories: pricing.accList.map((accessory) => accessory.label),
  };

  const handleAskAI = () => {
    const msg = `Tôi đang xem cấu hình ${carConfigText}. Bạn tư vấn thêm giúp tôi nhé.`;
    chat.sendWithContext(msg, selectedVehicleContext);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header chung */}
      <Header />

      {/* 3 panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel trái */}
        <div className="w-[340px] flex-shrink-0 bg-white border-r overflow-y-auto">
          <SelectorPanel
            configurator={configurator}
            onAskAI={handleAskAI}
            onRequestQuote={() => setShowModal(true)}
          />
        </div>

        {/* Panel giữa */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <PricingPanel
            configurator={configurator}
            onRequestQuote={() => setShowModal(true)}
          />
        </div>

        {/* Panel phải */}
        <div className="w-[380px] flex-shrink-0 bg-white border-l flex flex-col">
          <ChatPanel chat={chat} configurator={configurator} />
        </div>
      </div>

      {/* Modal nhận thông tin buyer */}
      <BuyerIdentityModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={(info) => {
          console.log("Lead info:", info);
          // TODO: POST /api/v1/quotes với info + config + pricing
        }}
        finalPrice={pricing.finalPrice}
        carConfig={carConfigText}
      />
    </div>
  );
}
