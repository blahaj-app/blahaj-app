import { Item } from "@blahaj-app/static";
import { ButtonGroup, Flex, Spinner } from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import eases from "eases";
import { AnimatePresence } from "framer-motion";
import type { FC } from "react";
import { useCallback } from "react";
import { route } from "routes-gen";
import { useGlobalDataQuery, useMapContext } from "../../routes/$item.map.($storeId)";
import { ITEM_NAME } from "../../utils/item-names";
import { MotionFlex } from "../motion-flex";
import ItemSelectorButton from "./item-selector-button";

const ItemSelector: FC = () => {
  const { params, loaderData } = useMapContext();

  const { isLoading } = useGlobalDataQuery(params.item as Item, loaderData ?? undefined);

  const navigate = useNavigate();

  const updateItem = useCallback(
    (newItem: string) => {
      if (newItem === params.item) return;
      navigate(route("/:item/map/:storeId?", { storeId: params.storeId, item: newItem }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [params, navigate],
  );

  return (
    <Flex
      position="absolute"
      top={{ base: "2", sm: "4" }}
      left="50%"
      transform="auto"
      translateX="-50%"
      zIndex="10"
      alignItems="stretch"
    >
      <ButtonGroup
        isAttached
        size={{ base: "md", sm: "lg" }}
        isDisabled={isLoading}
        background="white"
        rounded="full"
        shadow="lg"
        zIndex="20"
      >
        <ItemSelectorButton
          active={params.item === Item.BLAHAJ}
          rounded="start"
          onClick={() => updateItem(Item.BLAHAJ)}
        >
          {ITEM_NAME[Item.BLAHAJ]}
        </ItemSelectorButton>
        <ItemSelectorButton
          active={params.item === Item.SMOLHAJ}
          rounded="end"
          onClick={() => updateItem(Item.SMOLHAJ)}
        >
          {ITEM_NAME[Item.SMOLHAJ]}
        </ItemSelectorButton>
      </ButtonGroup>
      <AnimatePresence>
        {isLoading && (
          <MotionFlex
            initial={{ marginInlineStart: "-4.5rem" }}
            animate={{ marginInlineStart: "-1.5rem" }}
            exit={{ marginInlineStart: "-4.5rem" }}
            transition={{
              type: "tween",
              duration: 0.35,
              ease: eases.cubicOut,
            }}
            alignItems="center"
            paddingStart="8"
            paddingEnd="4"
            roundedEnd="full"
            background="white"
          >
            <Spinner color="blahaj.700" size="md" thickness="6px" />
          </MotionFlex>
        )}
      </AnimatePresence>
    </Flex>
  );
};

export default ItemSelector;
