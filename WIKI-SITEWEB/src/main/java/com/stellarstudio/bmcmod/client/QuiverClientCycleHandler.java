package com.stellarstudio.bmcmod.client;

import net.minecraft.client.Minecraft;
import net.minecraft.world.item.ItemStack;
import net.neoforged.api.distmarker.Dist;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.EventBusSubscriber;
import net.neoforged.neoforge.client.event.ClientTickEvent;
import net.neoforged.neoforge.network.PacketDistributor;

import com.stellarstudio.bmcmod.BmcMod;
import com.stellarstudio.bmcmod.item.QuiverHelper;
import com.stellarstudio.bmcmod.network.QuiverPackets;
import com.stellarstudio.bmcmod.registry.ModItems;

@EventBusSubscriber(modid = BmcMod.MODID, value = Dist.CLIENT)
public final class QuiverClientCycleHandler {
    private QuiverClientCycleHandler() {
    }

    @SubscribeEvent
    public static void onClientTick(ClientTickEvent.Post event) {
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || mc.screen != null || mc.isPaused()) {
            return;
        }
        if (BmcModKeyMappings.quiverCycleTypeKey == null || !BmcModKeyMappings.quiverCycleTypeKey.consumeClick()) {
            return;
        }
        int slot = QuiverHelper.findPrimaryQuiverSlot(mc.player, ModItems.QUIVER.get());
        if (slot < 0) {
            return;
        }
        ItemStack qs = mc.player.getInventory().getItem(slot);
        if (!qs.is(ModItems.QUIVER.get())) {
            return;
        }
        if (!QuiverHelper.normalize(QuiverHelper.get(qs)).hasAnyArrow()) {
            return;
        }
        PacketDistributor.sendToServer(new QuiverPackets.CycleSelectedTypePayload());
    }
}
