import {
  ButtonItem,
  definePlugin,
  PanelSection,
  PanelSectionRow,
  ServerAPI,
  staticClasses,
  DialogCheckbox,
  showModal,
  ConfirmModal
} from "decky-frontend-lib";
import React, { VFC, useState, useEffect } from "react";
import { FaBoxOpen } from "react-icons/fa";

interface Game {
  appid: number;
  name: string;
}

const Content: VFC<{ serverAPI: ServerAPI }> = ({ serverAPI }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [gamesWithShaderCache, setGamesWithShaderCache] = useState<Game[]>([]);
  const [gamesWithCompatData, setGamesWithCompatData] = useState<Game[]>([]);
  const [totalShaderCacheSize, setTotalShaderCacheSize] = useState<string>("");
  const [totalCompatDataSize, setTotalCompatDataSize] = useState<string>("");
  const [selectedGamesWithShaderCache, setSelectedGamesWithShaderCache] = useState<string[]>([]);
  const [selectedGamesWithCompatData, setSelectedGamesWithCompatData] = useState<string[]>([]);

  function handleShaderCacheCheckboxSelection(checked: boolean, appid: string) {
    let updatedList = [...selectedGamesWithShaderCache];
    if (checked) {
      updatedList = [...selectedGamesWithShaderCache, appid];
    } else {
      updatedList.splice(selectedGamesWithShaderCache.indexOf(appid), 1)
    }
    setSelectedGamesWithShaderCache(updatedList);
  }

  function handleCompatDataCheckboxSelection(checked: boolean, appid: string) {
    let updatedList = [...selectedGamesWithCompatData];
    if (checked) {
      updatedList = [...selectedGamesWithCompatData, appid];
    } else {
      updatedList.splice(selectedGamesWithCompatData.indexOf(appid), 1)
    }
    setSelectedGamesWithCompatData(updatedList);
  }
  
  async function clearDataCache(cacheDirName: string, appidArr?: string[]) {
    setIsLoading(true);
    if (appidArr && appidArr.length > 0) {
      await appidArr.forEach(async appid => await serverAPI.callPluginMethod("delete_cache", { dirName: `${cacheDirName}/${appid}` }));
    } else {
      await serverAPI.callPluginMethod("delete_cache", { dirName: cacheDirName })
    }
    setIsLoading(false);
  }

  useEffect(() => {
    const getGamesWithShaderCache = async () => await serverAPI.callPluginMethod("list_games_with_temp_data", { dirName: "shadercache" });
    getGamesWithShaderCache()
      .then(res => setGamesWithShaderCache(JSON.parse(`${res.result as Game[]}`)))
      .catch(e => {
        console.log(e.message)
      })

    const getGamesWithCompatData = async () => await serverAPI.callPluginMethod("list_games_with_temp_data", { dirName: "compatdata" });
    getGamesWithCompatData()
      .then(res => setGamesWithCompatData(JSON.parse(`${res.result as Game[]}`)))
      .catch(e => {
        console.log(e.message)
      })

    const getTotalShaderCacheSize = async () => await serverAPI.callPluginMethod("get_size", { dirName: "shadercache" });
    getTotalShaderCacheSize()
      .then(res => setTotalShaderCacheSize(res.result as string))
      .catch(e => {
        console.log(e.message)
      })
    
    const getTotalCompatDataSize = async () => await serverAPI.callPluginMethod("get_size", { dirName: "compatdata" });
    getTotalCompatDataSize()
      .then(res => setTotalCompatDataSize(res.result as string))
      .catch(e => {
        console.log(e.message)
      })
  }, [])

  return (
    <React.Fragment>
      <PanelSection title="Shader Cache" spinner={gamesWithShaderCache?.length === 0 && totalShaderCacheSize !== "0B"}>
        <PanelSectionRow>
          Total Size: { totalShaderCacheSize?.length > 0 ? totalShaderCacheSize : 'Calculating...' }
        </PanelSectionRow>
        {gamesWithShaderCache?.length > 0 && gamesWithShaderCache.map(({ appid, name }) => (
            <DialogCheckbox key={appid} label={name} color="blue" highlightColor="blue" onChange={checked => handleShaderCacheCheckboxSelection(checked, appid.toString())}/>
        ))}
        {gamesWithCompatData?.length > 0 && (
          <React.Fragment>
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                bottomSeparator="none"
                disabled={isLoading || selectedGamesWithShaderCache.length === 0}
                onClick={() => 
                  showModal(
                    <ConfirmModal
                      bOKDisabled={isLoading}
                      onCancel={() => {}} 
                      onOK={async () => await clearDataCache("shadercache", selectedGamesWithShaderCache)}
                      strTitle={"Clear Shader Cache"}
                      strOKButtonText={"Clear"}
                    >
                      Are you sure you want to clear the shader cache for <strong>{Array.from(gamesWithShaderCache.filter(({ appid }) => selectedGamesWithShaderCache.includes(appid.toString())).map(({ name }) => ` ${name}`)).toString()}</strong>?
                    </ConfirmModal>,
                  )
                }
              >
                Clear Selected Shader Cache
              </ButtonItem>
            </PanelSectionRow>
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                bottomSeparator="none"
                disabled={isLoading || totalShaderCacheSize === "0B"}
                onClick={() => 
                  showModal(
                    <ConfirmModal
                      bOKDisabled={isLoading}
                      onCancel={() => {}} 
                      onOK={async () => await clearDataCache("shadercache")}
                      strTitle={"Clear Shader Cache"}
                      strOKButtonText={"Clear"}
                    >
                      Are you sure you want to clear <strong>ALL</strong> shader cache?
                    </ConfirmModal>,
                  )
                }
              >
                Clear All Shader Cache
              </ButtonItem>
            </PanelSectionRow>
          </React.Fragment>
        )}
      </PanelSection>
      <PanelSection title="Compatibility Data" spinner={gamesWithCompatData?.length === 0 && totalCompatDataSize !== "0B"}>
        <PanelSectionRow>
          Total Size: { totalCompatDataSize?.length > 0 ? totalCompatDataSize : 'Calculating...'}
        </PanelSectionRow>
        {gamesWithCompatData?.length > 0 && gamesWithCompatData.map(({ appid, name }) => (
            <DialogCheckbox key={appid} label={name} onChange={checked => handleCompatDataCheckboxSelection(checked, appid.toString())} />
        ))}
        {gamesWithCompatData?.length > 0 && (
          <React.Fragment>
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                bottomSeparator="none"
                disabled={isLoading || selectedGamesWithCompatData.length === 0}
                onClick={() => 
                  showModal(
                    <ConfirmModal
                      bOKDisabled={isLoading}
                      onCancel={() => {}} 
                      onOK={async () => await clearDataCache("compatdata", selectedGamesWithCompatData)}
                      strTitle={"Clear Compatibility Data"}
                      strOKButtonText={"Clear"}
                    >
                      Are you sure you want to clear the compatibility data for <strong>{Array.from(gamesWithCompatData.filter(({ appid }) => selectedGamesWithCompatData.includes(appid.toString())).map(({ name }) => ` ${name}`)).toString()}</strong>?
                    </ConfirmModal>,
                  )
                }
              >
                Clear Selected Compat Data
              </ButtonItem>
            </PanelSectionRow>
            <PanelSectionRow>
              <ButtonItem
                layout="below"
                bottomSeparator="none"
                disabled={isLoading || totalCompatDataSize === "0B"}
                onClick={() => 
                  showModal(
                    <ConfirmModal
                      bOKDisabled={isLoading}
                      onCancel={() => {}} 
                      onOK={async () => await clearDataCache("compatdata")}
                      strTitle={"Clear Compatibility Data"}
                      strOKButtonText={"Clear"}
                    >
                      Are you sure you want to clear <strong>ALL</strong> compatibility data?
                    </ConfirmModal>,
                  )
                }
              >
                Clear All Compat Data
              </ButtonItem>
            </PanelSectionRow>
          </React.Fragment>
        )}
      </PanelSection>
   </React.Fragment>
  );
};

export default definePlugin((serverApi: ServerAPI) => {
  return {
    title: <div className={staticClasses.Title}>Storage Cleaner</div>,
    content: <Content serverAPI={serverApi} />,
    icon: <FaBoxOpen />,
  };
});
